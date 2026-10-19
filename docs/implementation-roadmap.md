# CollabSphere: Implementation Roadmap & Engineering Plan

> **Document Version:** 1.0.0  
> **Methodology:** Iterative Micro-Sprints with Antigravity AI Pair Programming  
> **Status:** Active Execution Plan  

---

## 1. Development Methodology & Pair-Programming Principles

To ensure that the student developer understands, debugs, and can defend every single line of code during academic reviews and viva voce examinations, CollabSphere strictly follows an **Iterative 9-Step Micro-Sprint Cycle**:

```text
[ 1. PLAN ] ──► [ 2. LEARN ] ──► [ 3. DESIGN ] ──► [ 4. IMPLEMENT ] ──► [ 5. TEST ]
                                                                             │
[ 9. CHECKPOINT ] ◄── [ 8. EXPLAIN BACK ] ◄── [ 7. VERIFY ] ◄── [ 6. REVIEW ]
```

### Core Pair-Programming Rules:
1. **Never Generate Blind Code**: Every architectural and library decision is explained before code generation.
2. **Small Controlled Changes**: Code is built module-by-module; no multi-thousand line dumps.
3. **Verify Every Step**: No feature is marked complete until its test passes and its UI/API response is verified.
4. **Active Student Mastery**: At the conclusion of each phase, the student explains the working mechanism in their own words.

---

## 2. Phase-by-Phase Implementation Roadmap

---

### Phase 0: Environment Audit & Repository Initialization
* **Status**: ✅ **COMPLETED**
* **Goal**: Audit local toolchains (Node.js, npm, Git), verify remote GitHub connectivity, isolate local repository, and identify database options.
* **Deliverables**:
  * Clean local Git repository isolated on branch `main`.
  * Remote origin linked to `https://github.com/NiravGandhi21/CollabSphere.git`.
  * Environment audit report confirming Node `v26.8.0`, npm `11.19.0`, and Git `2.55.0`.
  * MongoDB Atlas cluster provisioned (`collabsphere.m20nwgu.mongodb.net`).
* **Definition of Done (DoD)**: `git status` shows clean tree and synced remote tracking.

---

### Phase 1: Project Understanding & Requirements Engineering
* **Status**: 🔄 **CURRENT**
* **Goal**: Establish comprehensive project specifications, institutional context, user workflows, and engineering roadmap before writing code.
* **Deliverables**:
  * [docs/project-overview.md](file:///c:/Users/Gandhi%20Nirav%20P/OneDrive/Desktop/Collabsphere/docs/project-overview.md)
  * [docs/requirements.md](file:///c:/Users/Gandhi%20Nirav%20P/OneDrive/Desktop/Collabsphere/docs/requirements.md)
  * [docs/user-workflows.md](file:///c:/Users/Gandhi%20Nirav%20P/OneDrive/Desktop/Collabsphere/docs/user-workflows.md)
  * [docs/implementation-roadmap.md](file:///c:/Users/Gandhi%20Nirav%20P/OneDrive/Desktop/Collabsphere/docs/implementation-roadmap.md)
* **Verification**: All documentation verified for consistency, valid Mermaid syntax, and stable requirement IDs.
* **Definition of Done (DoD)**: All 4 documentation files committed and pushed to GitHub.

---

### Phase 2: System Architecture, Database Schemas & API Contracts
* **Status**: ⏳ **UPCOMING**
* **Prerequisites**: Phase 1 approval.
* **Goal**: Design the technical architecture, Mongoose schemas, and formal REST API contracts before writing code.
* **Tasks**:
  1. Define backend directory architecture (`controllers/`, `models/`, `routes/`, `middleware/`, `config/`).
  2. Define frontend component hierarchy and state architecture (`pages/`, `components/`, `context/`, `services/`).
  3. Design Mongoose schemas with data types, indexes, and relations (`User`, `Project`, `CollaborationRequest`).
  4. Specify complete REST API endpoint contracts (method, path, headers, request body, responses, error codes).
* **Deliverables**:
  * `docs/architecture.md`
  * `docs/database-design.md`
  * `docs/api-contracts.md`
* **Definition of Done (DoD)**: Architecture and schemas formally documented and approved by the student.

---

### Phase 3: Runtime Environment & Scaffolding
* **Status**: ⏳ **UPCOMING**
* **Prerequisites**: Phase 2 approval.
* **Goal**: Scaffold the dual-environment repository structure (`frontend/` and `backend/`), establish Express server with health routes, connect to MongoDB Atlas, and verify end-to-end runtime connectivity.
* **Tasks**:
  1. Create directory structure:
     ```text
     CollabSphere/
     ├── backend/
     ├── frontend/
     ├── docs/
     ├── .gitignore
     └── README.md
     ```
  2. **Backend Scaffolding**:
     * Initialize Node.js ES module project (`type: "module"`).
     * Install core dependencies: `express`, `mongoose`, `dotenv`, `cors`.
     * Create server entry point (`backend/src/server.js`) and app config (`backend/src/app.js`).
     * Create MongoDB Atlas connection utility (`backend/src/config/db.js`).
     * Implement `/api/health` endpoint returning server and database connection status.
     * Implement centralized error handler middleware.
  3. **Frontend Scaffolding**:
     * Scaffold React + Vite application in `frontend/`.
     * Install `react-router-dom` and minimal icons/utilities.
     * Implement minimal API client (`frontend/src/services/api.js`).
     * Build connectivity test card in `frontend/src/App.jsx` that queries `/api/health`.
  4. **Security & Secrets**:
     * Create `backend/.env.example` and local `backend/.env`.
     * Create `frontend/.env.example` and local `frontend/.env`.
     * Verify `.gitignore` prevents `.env` from ever being staged.
* **Tests to Run**:
  * `npm run dev` in backend $\rightarrow$ Express listens on port 5000 and connects to MongoDB Atlas without errors.
  * `curl http://localhost:5000/api/health` $\rightarrow$ Returns `{ status: "ok", database: "connected" }`.
  * `npm run dev` in frontend $\rightarrow$ Vite starts on port 5173; browser displays backend/database status as green checkmarks.
* **Definition of Done (DoD)**: Frontend communicates with backend, backend communicates with Atlas, and tests pass.

---

### Phase 4: Authentication & Student Profiles Module
* **Status**: ⏳ **UPCOMING**
* **Goal**: Implement secure user registration, login, JWT issuance, route protection, and student profile management.
* **Tasks**:
  1. Build `User` model with `bcryptjs` password hashing pre-save hook.
  2. Implement auth controllers (`register`, `login`, `getMe`).
  3. Create `authMiddleware` to verify JWT and attach `req.user`.
  4. Create frontend `AuthContext` to manage login state, user tokens, and logout.
  5. Build React pages: `RegisterPage`, `LoginPage`, and `ProfilePage`.
  6. Implement profile editing (headline, department, skills array, GitHub/LinkedIn links).
* **Tests to Run**:
  * Registration with duplicate email returns `400 Bad Request`.
  * Login with wrong password returns `401 Unauthorized`.
  * Protected `/api/users/profile/me` fails without Bearer token.
  * Updating skills in UI updates MongoDB Atlas document immediately.
* **Definition of Done (DoD)**: A student can register, log in, stay logged in on refresh, and update their skills.

---

### Phase 5: Project Showcase Module
* **Status**: ⏳ **UPCOMING**
* **Goal**: Implement project creation, public showcase views, and project editing.
* **Tasks**:
  1. Build `Project` model (title, summary, description, techStack, githubUrl, liveDemoUrl, creator, members, isAcceptingMembers).
  2. Implement project routes and controllers (`createProject`, `getProjects`, `getProjectById`, `updateProject`, `deleteProject`).
  3. Enforce authorization so only the project creator can edit or delete their project.
  4. Build React components:
     * `ProjectCreatePage`: Form with dynamic tech tag input pills and validation.
     * `ProjectDetailPage`: Showcase view with tech badges, GitHub/Live buttons, and contributor roster.
     * `ProjectCard`: Reusable card for grids and feeds.
* **Tests to Run**:
  * Creating a project without a title fails validation.
  * Project detail page populates creator details from `User` collection.
  * Non-creator cannot edit someone else's project (`403 Forbidden`).
* **Definition of Done (DoD)**: A student can publish a project and view it rendered in the public showcase.

---

### Phase 6: Student & Project Discovery Module
* **Status**: ⏳ **UPCOMING**
* **Goal**: Build rich search and multi-tag filtering across both student profiles and project showcases.
* **Tasks**:
  1. Implement MongoDB Atlas indexes on `skills` in `User` and `techStack` in `Project`.
  2. Build backend query filtering (`/api/projects?tech=...&search=...&open=...` and `/api/users?skill=...&search=...`).
  3. Build frontend search bars with debounced typing.
  4. Build filter pill controls (clickable tech tags that toggle active filter state).
  5. Implement friendly empty states when no results match.
* **Tests to Run**:
  * Filtering projects by `"React"` displays only matching projects.
  * Searching student directory by `"Python"` returns students with Python in their skills array.
  * Empty search displays clear reset instructions.
* **Definition of Done (DoD)**: Instant, responsive search and filtering operational across students and projects.

---

### Phase 7: Collaboration Requests & Team Formation Module
* **Status**: ⏳ **UPCOMING**
* **Goal**: Implement the core collaboration loop: join requests, applicant inbox, and automatic team roster updates.
* **Tasks**:
  1. Build `CollaborationRequest` model (`project`, `applicant`, `pitchMessage`, `status`).
  2. Create endpoints:
     * `POST /api/collaborations` (submit request).
     * `GET /api/collaborations/creator` (lead inbox).
     * `GET /api/collaborations/applicant` (student outgoing requests).
     * `PUT /api/collaborations/:id/status` (accept / decline).
  3. Build transactional logic: when lead accepts a request, append applicant to `Project.members`.
  4. Build frontend UI:
     * "Request to Join" modal with pitch message textarea.
     * "Applicant Management" dashboard tab for project creators.
     * "My Applications" tab for students to track status.
* **Tests to Run**:
  * Student cannot apply to their own project.
  * Duplicate applications are rejected with clear message.
  * Accepting an applicant updates request status to `Accepted` and shows applicant in project roster.
* **Definition of Done (DoD)**: End-to-end collaboration cycle verified from initial pitch to team roster display.

---

### Phase 8: UI Polish, Responsive Design & Demonstration Readiness
* **Status**: ⏳ **UPCOMING**
* **Goal**: Apply the refined White/Black/Green design aesthetic, guarantee mobile responsiveness, handle edge cases, and prepare viva documentation.
* **Tasks**:
  1. Implement cohesive design tokens (typography, emerald green accents, high-contrast dark cards, crisp white backgrounds).
  2. Test and refine layouts across mobile, tablet, and desktop viewports.
  3. Add toast notifications for all user actions.
  4. Audit accessibility, button tap targets, and contrast ratios.
  5. Prepare presentation walkthrough guide and viva Q&A cheat sheet for college examination.
* **Definition of Done (DoD)**: Polished, bug-free, fully responsive, and demonstrably ready for faculty evaluation.

---

## 3. Git Branching & Commit Conventions

To maintain a professional Git log:

### Commit Format:
```text
<type>(<scope>): <short description>
```
* `feat`: A new user-facing feature.
* `fix`: A bug fix.
* `docs`: Documentation changes.
* `style`: Formatting, CSS, design polish (no code logic changes).
* `refactor`: Restructuring code without changing behavior.
* `test`: Adding or updating test scripts.
* `chore`: Build tasks, package updates, config changes.

*Examples*:
* `docs: add CollabSphere Phase 1 project documentation`
* `feat(backend): implement user registration and JWT authentication`
* `feat(frontend): build project showcase detail page`

---

## 4. Risk Management & Mitigation Register

| Risk | Probability | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Atlas IP Whitelist Blocks Server** | Medium | High | Configure `0.0.0.0/0` during development; include connection diagnostic logging in `db.js`. |
| **Node.js v26 Alpha Compatibility** | Low | Medium | Avoid native C++ compiled packages; use pure JS dependencies (`bcryptjs`). |
| **Scope Creep (Adding Too Many Features)** | High | High | Strictly enforce MVP boundaries. Any new ideas are logged in `docs/requirements.md` under "Future Scope". |
| **Student Understanding Gap** | Medium | High | Maintain the 9-step pair-programming cycle; require student explanations before completing each phase. |
