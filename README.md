# CollabSphere

> **Student Collaboration & Capstone Project Showcase Platform**  
> Connect, build, recruit teammates, and showcase innovative college projects with real-time collaboration lifecycles, interactive 3D spatial network visualization, and production-grade security.

---

## 1. Project Overview

**CollabSphere** is a full-stack web platform built for engineering and university students to discover multidisciplinary peer talents, publish capstone and hackathon project showcases, and manage collaboration requests seamlessly.

### Core Capabilities
- **Project Showcase & Directory**: Rich project pages featuring problem statements, architectural overviews, live demo links, repository links, tech stack tagging, and recruitment status.
- **Interactive 3D Spatial Network**: Immersive visual canvas built on Three.js and React Three Fiber rendering interconnected student and project nodes with responsive orbit controls and reduced-motion fallback.
- **Collaboration Lifecycle Workflow**: State-machine-driven collaboration pipeline (`Pending` → `Accepted` | `Declined`). Accepting an applicant atomically appends their profile to the verified project roster via MongoDB `$addToSet`.
- **Student Profile Showcases**: Departmental student directories searchable by skills, faculties, graduation years, and authored/member projects.
- **Enterprise-Grade Security**: Helmet security headers, IP rate limiting, MongoDB operator sanitization, bcrypt password hashing (cost factor 12), and stateless JWT authorization.
- **Graceful Offline / Fallback Resilience**: Smart client services that operate seamlessly in real-backend mode and fall back to in-memory demonstration states when backend servers are undergoing maintenance.

---

## 2. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Vite + React 18 SPA                      │
│   • React Router DOM v6.28     • Lucide React Icons         │
│   • Three.js / R3F 3D Canvas   • Resilient Fallback Layer   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js 4.21 Backend                   │
│   • Helmet Security Headers    • Express Rate Limiting      │
│   • Express Mongo Sanitize     • Zod Input Validation       │
│   • JWT Auth (RS/HS256)        • Morgan HTTP Logging        │
│   • /api/health (Liveness)     • /api/healthz (Readiness)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose 8.9 (ODM)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               MongoDB Atlas Cloud Database                  │
│   • Partial Unique Indexes     • Text Search Indexes        │
│   • Compound Filtering Indexes • Atomic Cascades            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Repository Structure

```text
Collabsphere/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow (tests, build, audit)
├── .dockerignore                # Root Docker build exclusion rules
├── .gitignore                   # Git repository ignore rules
├── .nvmrc                       # Pinned Node.js LTS version (20.17.0)
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Unified container local/staging runner
├── README.md                    # Project documentation entry point
├── backend/
│   ├── .dockerignore            # Backend-specific container ignore
│   ├── .env.example             # Documented backend environment template
│   ├── .gitignore               # Backend Git ignore rules
│   ├── Dockerfile               # Backend-only container build
│   ├── config/db.js             # Mongoose connection & lifecycle handlers
│   ├── controllers/             # Express route controllers (Auth, Project, User, Collab)
│   ├── middleware/              # Auth guard & centralized safe error handling
│   ├── models/                  # Mongoose data models with strict schemas & indexes
│   ├── routes/                  # Express API route declarations
│   ├── tests/                   # Vitest automated test suite (in-memory Mongo engine)
│   └── server.js                # Express entry point, security middleware, and health probes
├── frontend/
│   ├── .env.example             # Documented frontend environment template
│   ├── .gitignore               # Frontend Git ignore rules
│   ├── index.html               # SPA entry point
│   ├── vite.config.js           # Vite bundle configuration with manual chunk splitting
│   └── src/
│       ├── components/          # Reusable UI components & 3D canvases
│       ├── context/             # AuthContext and ToastContext providers
│       ├── pages/               # Route pages (Showcase, Profile, Directory, Auth)
│       └── services/            # Client API client with token lifecycle & mock fallback
└── docs/
    ├── api-contracts.md         # Canonical REST API specifications
    ├── architecture.md          # Architectural blueprints and diagrams
    ├── backend-learning-notes.md# Engineering patterns and implementation notes
    ├── deployment.md            # Host-specific deployment configurations
    ├── implementation-roadmap.md# Roadmap and milestones
    ├── project-overview.md      # Problem statement and domain context
    ├── requirements.md          # Functional & non-functional requirements
    └── user-workflows.md        # User journey maps and state machines
```

---

## 4. Prerequisites

- **Node.js**: `v20.17.0` (LTS) or higher. Check via `node -v`.
- **npm**: `v10.0.0` or higher. Check via `npm -v`.
- **MongoDB Atlas**: Free M0 cluster or self-hosted MongoDB instance (4.4+).

---

## 5. Quick Start (Clean Checkout)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/CollabSphere.git
cd CollabSphere
```

### 2. Backend Setup
```bash
cd backend
npm ci

# Create your local environment configuration
cp .env.example .env
```
Open `backend/.env` and supply your actual configuration (see Section 6 below).

Start the backend development server:
```bash
npm run dev
# Server starts at http://localhost:5000
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm ci

# Create your frontend environment configuration
cp .env.example .env
```

Start the Vite development server:
```bash
npm run dev
# Frontend dev server starts at http://localhost:5173
```

---

## 6. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | Port on which Express listens for incoming HTTP requests. |
| `MONGODB_URI` | **Yes** | — | MongoDB Atlas SRV connection string (e.g. `mongodb+srv://...`). |
| `JWT_SECRET` | **Yes** | — | Cryptographically random string (min 32 chars) for signing session tokens. |
| `JWT_EXPIRES_IN`| No | `7d` | Token lifetime format (e.g. `7d`, `24h`, `3600s`). |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed frontend origin for CORS headers. In production, set to your live domain. |
| `SERVE_STATIC` | No | `false` | When set to `true`, Express serves `./public` static Vite assets (used in Docker). |

> **Security Note:** Never commit `backend/.env` or any file containing real database credentials or JWT secrets. It is strictly excluded by `.gitignore`.

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_API_URL` | No | `http://localhost:5000/api` | Base URL pointing to the Express API. For unified containers (`SERVE_STATIC=true`), use `/api`. |

---

## 7. MongoDB Atlas Configuration Guide

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a free **M0 Sandbox Cluster**.
3. Under **Security → Database Access**, create a database user with `readWriteAnyDatabase` privileges.
4. Under **Security → Network Access**, add your hosting environment IP address (or `0.0.0.0/0` with secure credentials for serverless/PaaS platforms like Render).
5. Under **Deployment → Database**, click **Connect → Drivers (Node.js)** and copy your connection string.
6. Replace `<username>` and `<password>` with your database user credentials.
7. Paste this URI into `backend/.env` under `MONGODB_URI`:
   ```bash
   MONGODB_URI=mongodb+srv://<db-user>:<db-password>@cluster0.abcde.mongodb.net/collabsphere?retryWrites=true&w=majority
   ```

---

## 8. Automated Testing

### Backend Unit & Integration Tests
Backend tests run on **Vitest** utilizing an in-memory MongoDB replica via `mongodb-memory-server`. Testing requires zero remote network calls and guarantees isolation:
```bash
cd backend
npm test
```
*Current test suite: 39 passing tests across 5 test suites covering auth, user models, project roster constraints, collaboration state machines, and cascade deletions.*

### Frontend Production Build Verification
```bash
cd frontend
npm run build
```
Generates production-ready, minified, gzip-optimized chunks in `frontend/dist`.

---

## 9. Health & Readiness Endpoints

The API exposes two diagnostic health endpoints for load balancers and container orchestrators:

- **Liveness Probe**: `GET /api/health`
  - Returns `200 OK` promptly when the Node.js API process is responsive, reporting the database status (`connected` or `disconnected`).
  ```bash
  curl -i http://localhost:5000/api/health
  ```
- **Readiness Probe**: `GET /api/healthz`
  - Returns `200 OK` only when the active MongoDB connection state is `connected` (`readyState === 1`).
  - Returns `503 Service Unavailable` if MongoDB is unreachable or in unconfigured fallback mode.
  ```bash
  curl -i http://localhost:5000/api/healthz
  ```

---

## 10. Docker & Containerized Deployment

CollabSphere includes a multi-stage `Dockerfile` capable of packaging the Vite frontend and Express backend into a single secure, non-root Alpine container:

### Build Container Image
```bash
docker build -t collabsphere:latest .
```

### Run with Docker Compose
```bash
# Ensure backend/.env exists with valid variables
docker compose up --build
```

### Run Container Standalone
```bash
docker run -d \
  -p 5000:5000 \
  -e PORT=5000 \
  -e MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/collabsphere" \
  -e JWT_SECRET="your-secure-random-jwt-secret-key" \
  -e CLIENT_URL="http://localhost:5000" \
  -e SERVE_STATIC="true" \
  collabsphere:latest
```

---

## 11. CI/CD Pipeline

The repository includes a GitHub Actions continuous integration workflow configured in `.github/workflows/ci.yml`. On every push and pull request to `main`, it:
1. Validates clean checkout on Ubuntu LTS.
2. Sets up Node.js `20.17.0`.
3. Installs backend dependencies and executes Vitest test suite.
4. Installs frontend dependencies and executes production bundle build.
5. Builds Docker container image to prevent containerization regressions.
6. Runs non-blocking dependency audits on production packages.

---

## 12. Documentation Index

For deep architectural and technical specifications, explore the `docs/` directory:
- [API Contracts](docs/api-contracts.md)
- [Architecture Blueprint](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [Backend Engineering Notes](docs/backend-learning-notes.md)
- [Functional Requirements](docs/requirements.md)
- [User Workflows & State Machines](docs/user-workflows.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)
- [Project Overview](docs/project-overview.md)

---

## 13. License

This project is licensed under the MIT License.
