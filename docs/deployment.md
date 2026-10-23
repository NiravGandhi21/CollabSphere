# Deployment Guide for CollabSphere

## Supported Node.js version

- **Node.js LTS**: `20.17.0` (defined in root `.nvmrc` and `engines` fields of both frontend and backend `package.json`).
- Ensure your development environment uses the same version. Tools like `nvm` or `fnm` can automatically pick the version from `.nvmrc`.

## Local Development Setup

```bash
# Clone the repository (if you haven't already)
git clone <repo-url>
cd Collabsphere

# Use the correct Node version (nvm example)
nvm install && nvm use

# Install backend dependencies
cd backend
npm ci

# Install frontend dependencies
cd ../frontend
npm ci
```

## Environment Variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`). Required variables:

- `PORT` – Port for the Express server (default `5000`).
- `MONGODB_URI` – MongoDB Atlas connection string.
- `JWT_SECRET` – Secret for signing JWT tokens.
- `CLIENT_URL` – URL where the React frontend is served (e.g., `http://localhost:5173`).
- `SERVE_STATIC` – Set to `true` to let Express serve the built frontend assets (used in the Docker image).

> **Never commit** the `.env` file. It is ignored by Git.

## Frontend Production Build

```bash
cd frontend
npm run build
```
The build output is placed in `frontend/dist`.

## Docker Build & Run

### Build the image

```bash
# Build the multi‑stage image (backend + frontend) from the repository root
docker build -t collabsphere:latest .
```

### Run the container

```bash
# Replace placeholders with your actual values or mount a .env file
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI="your-atlas-connection" \
  -e JWT_SECRET="your-secret" \
  -e CLIENT_URL="http://localhost:5000" \
  -e SERVE_STATIC="true" \
  collabsphere:latest
```
The container will expose port `5000` (or the value of `$PORT`).

### Health checks

- **Liveness**: `GET http://localhost:5000/api/health`
- **Readiness**: `GET http://localhost:5000/api/healthz` (returns `200` only when MongoDB is reachable).

## Docker Compose (optional)

A `docker-compose.yml` is provided at the repository root. After creating a `backend/.env` file with the required variables, run:

```bash
docker compose up --build
```

## CI/CD (GitHub Actions)

The workflow `.github/workflows/ci.yml` runs on every push and pull request. It:

1. Checks out the code.
2. Sets up Node.js `20.17.0`.
3. Installs backend and frontend dependencies.
4. Executes backend tests.
5. Lints (if a lint script exists) and builds the frontend.
6. Builds the Docker image.
7. Audits production dependencies for high‑severity vulnerabilities.

All steps run without requiring any secrets; production credentials are not needed for CI.

## Smoke‑Testing the Docker Image

After building the image, you can quickly verify the health endpoints:

```bash
# Start the container in the background
docker run -d -p 5000:5000 -e MONGODB_URI="your-atlas-uri" -e JWT_SECRET="test-secret" collabsphere:latest

# Wait a few seconds for the app to start, then test the endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/healthz
```
Both should return a JSON payload with `status: "ok"` and a `connected` database state.

## Rollback Guidance

- To revert to a previous version, pull the desired Git tag/commit and rebuild the Docker image.
- If you use Docker Compose, `docker compose down && docker compose up --build` will replace the running container.

## Remaining Production Requirements (not yet automated)

- **HTTPS** termination (use a reverse proxy like Nginx or cloud load balancer).
- **Rate‑limit tuning** for production traffic.
- **Monitoring & alerting** (Prometheus, Grafana, or cloud provider metrics).
- **Zero‑downtime deployments** (Blue‑Green or rolling updates via orchestration platform).
- **Secrets management** (inject `MONGODB_URI` and `JWT_SECRET` via a secret manager, not plain env files).

---
*This document is intentionally generic; replace placeholder values with your actual deployment configuration.*
