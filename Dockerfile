# ── CollabSphere – Full-Stack Dockerfile (root) ───────────────────────────────
# Stage 1 – Build the Vite frontend
# Stage 2 – Install backend production dependencies
# Stage 3 – Runtime: Express serves API + static Vite assets
#
# The backend must be configured to serve frontend/dist as static files when
# SERVE_STATIC=true is set; otherwise use a separate static host (CDN/Nginx).
# All environment variables are injected at runtime – do NOT bake .env files.

# ── Stage 1: Frontend build ───────────────────────────────────────────────────
FROM node:20.19.0-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts

COPY frontend/ .
RUN npm run build

# ── Stage 2: Backend dependencies ────────────────────────────────────────────
FROM node:20.19.0-alpine AS backend-deps

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM node:20.19.0-alpine AS runner

RUN apk add --no-cache dumb-init

WORKDIR /app

# Run as non-root
USER node

# Backend source + production modules
COPY --chown=node:node --from=backend-deps /app/backend/node_modules ./node_modules
COPY --chown=node:node backend/ .

# Frontend build output – served as static assets by Express
COPY --chown=node:node --from=frontend-builder /app/frontend/dist ./public

ENV NODE_ENV=production
# Set SERVE_STATIC=true so Express serves ./public (see server.js static middleware)
ENV SERVE_STATIC=true

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
