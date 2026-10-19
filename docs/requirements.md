# CollabSphere: Requirements Specification

> **Document Version:** 1.0.0  
> **Status:** Approved Baseline for MVP  
> **Target Platform:** MERN Stack Web Application  

---

## 1. Introduction & Scope Classification

This document specifies the complete functional and non-functional requirements for the **CollabSphere** platform. Requirements are categorized into:
* **Core MVP (Minimum Viable Product)**: Must be fully implemented, tested, and demonstrated in the initial release.
* **Phase 2 (Post-MVP Enhancements)**: Planned features deferred until the core collaboration loop is verified.
* **Future Scope**: Visionary concepts requiring additional third-party infrastructure.

---

## 2. User Roles & Access Control Matrix

| Role | Description | Permissions |
| :--- | :--- | :--- |
| **Guest / Visitor (Unauthenticated)** | Any user visiting the platform without logging in. | • Browse public project showcases.<br>• Filter projects by tags/skills.<br>• View student public profiles.<br>• Register and Log in. |
| **Student Member (Authenticated)** | Registered student of the platform. | • All Visitor permissions.<br>• Maintain personal profile (skills, bio, links).<br>• Create new project showcases.<br>• Submit collaboration join requests.<br>• Track submitted requests. |
| **Project Creator / Team Lead** | Authenticated student who authored a project showcase. | • All Student Member permissions.<br>• Edit or delete own project showcase.<br>• Review incoming collaboration requests for own projects.<br>• Accept or decline applicants.<br>• Manage project team roster. |
| **System Administrator (Future Scope)** | University moderator or platform administrator. | • Global moderation of reported content.<br>• User deactivation or ban. |

---

## 3. Functional Requirements (FR)

### 3.1 Authentication & Session Management

* **`FR-AUTH-01` [User Registration]**  
  The system shall allow new students to register using their full name, valid email address, password, academic department, and graduation year/semester.
  * *Validation*: Email must conform to standard RFC 5322 format; password must be at least 6 characters; all fields are mandatory.

* **`FR-AUTH-02` [Secure Password Hashing]**  
  The system shall never store plaintext passwords. Passwords must be cryptographically hashed using `bcryptjs` with a work factor (salt rounds) of at least 10 prior to database persistence.

* **`FR-AUTH-03` [User Login & Token Issuance]**  
  The system shall authenticate students using their registered email and password. Upon successful validation, the server shall issue a JSON Web Token (JWT) encoding the student's unique ID and role.

* **`FR-AUTH-04` [Persistent Authentication State]**  
  The frontend client shall securely retain the authentication token across browser page reloads and automatically attach it as a Bearer token in the HTTP `Authorization` header on all protected API requests.

* **`FR-AUTH-05` [User Logout]**  
  The system shall allow logged-in students to terminate their session, clearing local auth tokens and resetting the frontend client state to Unauthenticated.

---

### 3.2 Student Profiles & Skill Management

* **`FR-PROF-01` [Profile Creation & Retrieval]**  
  The system shall automatically generate a profile record upon user registration and allow students to view their profile details.

* **`FR-PROF-02` [Profile Update]**  
  The system shall allow authenticated students to edit their own profile fields, including headline/bio, skills array (e.g., `["React", "Node.js", "Python"]`), GitHub profile URL, and LinkedIn URL.

* **`FR-PROF-03` [Profile Authorization Protection]**  
  The system shall enforce authorization such that a student can only modify their own profile record. Attempted modifications to another user's profile shall return an HTTP `403 Forbidden`.

* **`FR-PROF-04` [Public Profile View]**  
  The system shall provide a public profile view accessible by any user, displaying the student's name, department, semester, skills, bio, links, and projects authored or co-created.

---

### 3.3 Student Discovery & Directory

* **`FR-DISC-01` [Student Directory Listing]**  
  The system shall display a browsable directory of registered students with their avatar/initials, department, headline, and top skill tags.

* **`FR-DISC-02` [Search & Filter Students by Skill]**  
  The system shall allow users to search the student directory by student name and filter students by one or more selected technical skills.

---

### 3.4 Project Creation & Showcase

* **`FR-PROJ-01` [Project Showcase Creation]**  
  The system shall allow authenticated students to publish a new project showcase with:
  * Title (3–100 characters).
  * Short summary / tagline (10–200 characters).
  * Comprehensive description & problem statement.
  * Technology stack tags (array of strings, e.g., `["React", "Express", "MongoDB"]`).
  * GitHub repository URL (validated URL format).
  * Live demo URL (optional, validated URL format).
  * Open collaboration status (Boolean: `isAcceptingMembers`).
  * Required collaboration roles (e.g., `"Frontend Engineer"`, `"ML Specialist"`).

* **`FR-PROJ-02` [Project Showcase Detail Page]**  
  The system shall render a comprehensive project view displaying the project title, summary, full description, tech stack tags, repository/demo links, creator profile card, and confirmed team roster.

* **`FR-PROJ-03` [Project Search & Technology Filtering]**  
  The system shall provide real-time search across project titles and summaries, and allow filtering projects by technology stack tags (e.g., all projects using `Node.js`).

* **`FR-PROJ-04` [Project Showcase Management]**  
  The system shall allow project creators to edit project attributes or toggle `isAcceptingMembers` at any time.

* **`FR-PROJ-05` [Project Deletion]**  
  The system shall allow project creators to permanently delete their project showcase. Deletion shall cascade or invalidate associated collaboration requests.

---

### 3.5 Collaboration Requests & Team Formation

* **`FR-COLLAB-01` [Submit Collaboration Request]**  
  The system shall allow authenticated students to submit a collaboration join request to any project that has `isAcceptingMembers: true`.
  * *Request Payload*: Pitch message explaining interest and proposed contribution (20–500 characters).
  * *Constraint*: A student cannot submit a join request to their own project.
  * *Constraint*: A student cannot submit duplicate active requests to the same project.

* **`FR-COLLAB-02` [Collaboration Request Inbox for Project Leads]**  
  The system shall provide project creators with a management dashboard displaying all incoming requests for their projects with applicant details, pitch message, and submission timestamp.

* **`FR-COLLAB-03` [Accept / Decline Request]**  
  The project creator shall have the ability to either **Accept** or **Decline** a pending collaboration request.
  * When **Accepted**: The request status updates to `Accepted`, and the applicant is automatically added to the project's confirmed `members` list.
  * When **Declined**: The request status updates to `Declined`.

* **`FR-COLLAB-04` [Applicant Status Tracking]**  
  The system shall allow applicants to view all collaboration requests they have submitted alongside their current status (`Pending`, `Accepted`, `Declined`).

* **`FR-COLLAB-05` [Team Roster Display]**  
  The project showcase page shall dynamically render the confirmed team roster, displaying the project creator as `Lead` and all accepted collaborators as `Team Members`.

---

## 4. Scope Exclusions (Explicitly Deferred)

To ensure high quality, thorough testing, and timely delivery of the college project, the following features are **explicitly excluded from the MVP**:

| Excluded Feature | Rationale for Exclusion | Target Future Phase |
| :--- | :--- | :--- |
| **Direct Real-Time Messaging (WebSockets)** | Introduces socket connection lifecycle complexity and state synchronization before REST foundation is proven. | Phase 2 |
| **Real-time Push Notifications** | Requires persistent socket servers or third-party push notification services. | Phase 2 |
| **Social Likes & Upvote Leaderboards** | Non-essential for initial core collaboration loop; risk of gamification before content exists. | Phase 2 |
| **Direct File & Image Uploads (S3/Cloudinary)** | Requires external AWS/cloud storage buckets, IAM credentials, and multipart parsing. MVP uses HTTPS URL links for demos and avatars. | Phase 2 |
| **Three.js 3D Interactive Visualizations** | Heavy WebGL dependencies that could introduce browser rendering issues or slow down initial page loads. | Phase 3 |
| **University Administrative SIS Integration** | Requires institutional API access and administrative permissions not available for independent student projects. | Future |

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Security & Data Protection (`NFR-SEC`)
* **`NFR-SEC-01` [Password Encryption]**: Passwords must be hashed using `bcryptjs` with salt rounds $\ge 10$. Plaintext passwords must never appear in logs, responses, or error messages.
* **`NFR-SEC-02` [JWT Security]**: JSON Web Tokens must be signed with an application secret stored exclusively in server environment variables. Tokens must have an expiration window (e.g., 7 days).
* **`NFR-SEC-03` [Route Protection Middleware]**: Protected API endpoints must verify token validity and reject unauthenticated calls with HTTP `401 Unauthorized`.
* **`NFR-SEC-04` [Resource Authorization]**: Endpoints modifying or deleting resources (profiles, projects, requests) must verify that `req.user.id` matches the resource owner, returning `403 Forbidden` on mismatch.
* **`NFR-SEC-05` [Input Sanitization & Injection Prevention]**: Mongoose schemas must strictly enforce data types and lengths to prevent NoSQL query injection.
* **`NFR-SEC-06` [Environment Variable Isolation]**: Database connection strings, Atlas credentials, and JWT secrets must never be committed to Git or exposed to the client bundle.

### 5.2 Performance & Responsiveness (`NFR-PERF`)
* **`NFR-PERF-01` [API Response Latency]**: Standard database read and write endpoints must respond within 500ms under standard network conditions.
* **`NFR-PERF-02` [Database Indexing]**: Database collections must index frequently queried fields (`skills`, `tags`, `email`, `project`, `applicant`) to avoid full collection scans.
* **`NFR-PERF-03` [Client Load Speed]**: Vite frontend build must bundle assets efficiently with code splitting, achieving First Contentful Paint (FCP) in under 1.5s on desktop broadband.

### 5.3 Usability & Design (`NFR-USAB`)
* **`NFR-USAB-01` [Aesthetic Theme]**: The user interface must implement a clean, high-contrast, modern White/Black/Green design system with consistent typography, subtle borders, and smooth hover micro-interactions.
* **`NFR-USAB-02` [Responsive Viewports]**: Layouts must be responsive and functional across mobile ($\ge 360\text{px}$), tablet ($\ge 768\text{px}$), and desktop ($\ge 1024\text{px}$) viewports.
* **`NFR-USAB-03` [User Feedback States]**: Every asynchronous action (submitting a form, creating a project, sending a request) must provide immediate visual feedback (loading spinners, disabled buttons, toast notifications).
* **`NFR-USAB-04` [Empty & Error States]**: When search queries yield no results or collections are empty, friendly informational screens with actionable next steps must be presented.

### 5.4 Reliability & Maintainability (`NFR-MAINT`)
* **`NFR-MAINT-01` [Modular Architecture]**: The codebase must adhere to strict modularity: backend structured into `controllers/`, `models/`, `routes/`, `middleware/`, and `config/`; frontend organized into `components/`, `pages/`, `context/`, and `services/`.
* **`NFR-MAINT-02` [Centralized Error Handling]**: The Express server must implement a centralized error handling middleware returning standardized JSON error responses: `{ success: false, message: "..." }`.
* **`NFR-MAINT-03` [Zero Unhandled Crashes]**: All asynchronous database and network operations must utilize `try/catch` or wrapper utilities to prevent server process terminations.

---

## 6. Testable Acceptance Criteria Matrix

| Requirement ID | Test Scenario | Expected Result | Acceptance Status |
| :--- | :--- | :--- | :--- |
| **`FR-AUTH-01`** | Register with valid student details. | Account created in MongoDB Atlas; HTTP 201; returns auth token and user profile summary. | ⏳ Pending Phase 4 |
| **`FR-AUTH-01`** | Register with existing email. | Request rejected; HTTP 400; message: "Email already registered". | ⏳ Pending Phase 4 |
| **`FR-AUTH-03`** | Log in with correct email/password. | HTTP 200; returns valid JWT; user redirected to dashboard. | ⏳ Pending Phase 4 |
| **`FR-AUTH-03`** | Log in with incorrect password. | HTTP 401; message: "Invalid credentials". | ⏳ Pending Phase 4 |
| **`FR-PROF-02`** | Update user skills to `["React", "Node.js"]`. | Profile updated in database; HTTP 200; new skills visible on profile page. | ⏳ Pending Phase 4 |
| **`FR-PROJ-01`** | Create project with missing title. | Request rejected; HTTP 400; message: "Project title is required". | ⏳ Pending Phase 5 |
| **`FR-PROJ-01`** | Create valid project with tech tags. | HTTP 201; project saved; user listed as project creator; visible in public directory. | ⏳ Pending Phase 5 |
| **`FR-PROJ-03`** | Search projects by tag `"MongoDB"`. | Directory updates to render only projects containing `"MongoDB"` in tech stack. | ⏳ Pending Phase 6 |
| **`FR-COLLAB-01`** | Student applies to open project. | Request saved with status `Pending`; HTTP 201; applicant cannot apply a second time. | ⏳ Pending Phase 7 |
| **`FR-COLLAB-01`** | Project creator tries to apply to own project. | Request rejected; HTTP 400; message: "Cannot request to join your own project". | ⏳ Pending Phase 7 |
| **`FR-COLLAB-03`** | Project lead clicks "Accept" on request. | Request status transitions to `Accepted`; applicant user ID added to project `members` array. | ⏳ Pending Phase 7 |
| **`FR-COLLAB-05`** | View project showcase after acceptance. | Accepted student's avatar and name appear under "Team Members" on showcase page. | ⏳ Pending Phase 7 |
