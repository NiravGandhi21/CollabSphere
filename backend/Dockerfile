# ── CollabSphere Backend – Dockerfile ─────────────────────────────────────────
# Multi-stage build: only production dependencies are copied to the final image.
# Runs as non-root user (node) for security.
# Expects all required environment variables to be injected at runtime via
# docker run -e / docker-compose / your orchestration platform.
# DO NOT bake .env files or secrets into this image.

# ── Stage 1: dependency installer ────────────────────────────────────────────
FROM node:20.17.0-alpine AS deps

WORKDIR /app

# Copy manifest and lockfile first (layer-cache friendly)
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# ── Stage 2: final runtime image ─────────────────────────────────────────────
FROM node:20.17.0-alpine AS runner

# Install dumb-init for proper signal forwarding (graceful shutdown)
RUN apk add --no-cache dumb-init

WORKDIR /app

# Run as non-root user
USER node

# Copy installed production node_modules from deps stage
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=node:node . .

# Set production environment
ENV NODE_ENV=production

# Expose backend port (must match PORT env variable)
EXPOSE 5000

# Use dumb-init to forward OS signals correctly → enables graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
