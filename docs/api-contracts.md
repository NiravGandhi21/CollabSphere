# CollabSphere: REST API Contracts Specification

> **Document Version:** 1.0.0  
> **Status:** Approved Baseline derived from actual frontend service layer (`frontend/src/services/`)  
> **Base URL:** `/api`  
> **Data Format:** JSON (`Content-Type: application/json`)  
> **Standard Response Envelope:**  
> Success: `{ "success": true, "data": ..., "message"?: string }`  
> Error: `{ "success": false, "message": string, "errors"?: array }`

---

## 1. Authentication & Session Module (`/api/auth`)

### 1.1 Register New Student Account
* **Originating View**: `frontend/src/pages/RegisterPage.jsx` (`FR-AUTH-01`)
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Nirav Gandhi",
    "email": "nirav.gandhi@itmuniversity.ac.in",
    "password": "password123",
    "department": "Computer Science & Engineering",
    "graduationYear": 2026,
    "semester": "6th Semester"
  }
  ```
* **Validation Rules**:
  - `name`: String, required, 2–80 characters.
  - `email`: String, required, standard RFC 5322 email regex, unique in database.
  - `password`: String, required, min 6 characters. Hashed using `bcryptjs` (salt rounds $\ge 10$).
  - `department`: String, required, must be valid university department.
  - `graduationYear`: Number, 2024–2030.
  - `semester`: String, required.
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "67b01a23e4b0a1a2b3c4d5e6",
        "name": "Nirav Gandhi",
        "email": "nirav.gandhi@itmuniversity.ac.in",
        "department": "Computer Science & Engineering",
        "graduationYear": 2026,
        "semester": "6th Semester",
        "headline": "Student Engineer",
        "bio": "",
        "skills": ["JavaScript"],
        "githubUrl": "",
        "linkedinUrl": "",
        "portfolioUrl": "",
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Nirav%20Gandhi",
        "role": "student",
        "joinedDate": "2025-02-15T10:00:00.000Z"
      }
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Validation failure or duplicate email (`{ "success": false, "message": "Email is already registered" }`).

---

### 1.2 Student Login
* **Originating View**: `frontend/src/pages/LoginPage.jsx` (`FR-AUTH-03`)
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "nirav.gandhi@itmuniversity.ac.in",
    "password": "password123"
  }
  ```
* **Validation Rules**: Both fields required, non-empty.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "67b01a23e4b0a1a2b3c4d5e6",
        "name": "Nirav Gandhi",
        "email": "nirav.gandhi@itmuniversity.ac.in",
        "department": "Computer Science & Engineering",
        "semester": "6th Semester",
        "headline": "Full-Stack MERN Developer & Systems Architect",
        "skills": ["React", "Node.js", "Express", "MongoDB"],
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        "role": "student"
      }
    }
  }
  ```
* **Error Responses**:
  - `401 Unauthorized`: Invalid credentials (`{ "success": false, "message": "Invalid email or password" }`).

---

### 1.3 Get Current Authenticated User
* **Originating View**: `frontend/src/context/AuthContext.jsx` (`FR-AUTH-04`)
* **Endpoint**: `GET /api/auth/me`
* **Access**: Authenticated (`Bearer <token>`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "67b01a23e4b0a1a2b3c4d5e6",
        "name": "Nirav Gandhi",
        "email": "nirav.gandhi@itmuniversity.ac.in",
        "department": "Computer Science & Engineering",
        "semester": "6th Semester",
        "skills": ["React", "Node.js", "Express", "MongoDB"],
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        "role": "student"
      }
    }
  }
  ```
* **Error Responses**:
  - `401 Unauthorized`: Missing or expired token.

---

## 2. Student Directory & Profiles Module (`/api/users`)

### 2.1 Get Students Directory with Search & Filters
* **Originating View**: `frontend/src/pages/StudentsPage.jsx` (`FR-DISC-01`, `FR-DISC-02`)
* **Endpoint**: `GET /api/users`
* **Access**: Public
* **Query Parameters**:
  - `search` (optional): Case-insensitive search on `name`, `headline`, `bio`, `department`.
  - `skill` (optional): Normalized skill tag filter (matches in `skills` array).
  - `department` (optional): Exact department match.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "usr_01",
        "name": "Nirav Gandhi",
        "department": "Computer Science & Engineering",
        "graduationYear": 2026,
        "semester": "6th Semester",
        "headline": "Full-Stack MERN Developer & Systems Architect",
        "skills": ["React", "Node.js", "Express", "MongoDB"],
        "avatar": "https://images.unsplash.com/...",
        "githubUrl": "https://github.com/NiravGandhi21"
      }
    ]
  }
  ```

---

### 2.2 Get Single Student Profile with Populated Projects
* **Originating View**: `frontend/src/pages/StudentProfilePage.jsx` (`FR-PROF-04`)
* **Endpoint**: `GET /api/users/:id`
* **Access**: Public
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_01",
      "name": "Nirav Gandhi",
      "email": "nirav.gandhi@itmuniversity.ac.in",
      "department": "Computer Science & Engineering",
      "graduationYear": 2026,
      "semester": "6th Semester",
      "headline": "Full-Stack MERN Developer & Systems Architect",
      "bio": "Passionate about building scalable web applications...",
      "skills": ["React", "Node.js", "Express", "MongoDB"],
      "githubUrl": "https://github.com/NiravGandhi21",
      "linkedinUrl": "https://linkedin.com/in/niravgandhi",
      "portfolioUrl": "https://niravgandhi.dev",
      "avatar": "https://images.unsplash.com/...",
      "authoredProjects": [
        {
          "id": "proj_01",
          "title": "EcoTracker — Carbon Footprint Analytics",
          "tagline": "Empowering university campuses to measure...",
          "category": "Web Application / Sustainability",
          "techStack": ["React", "Node.js", "Express", "MongoDB"],
          "isAcceptingMembers": true
        }
      ],
      "memberProjects": []
    }
  }
  ```
* **Error Responses**:
  - `404 Not Found`: Student profile does not exist.

---

### 2.3 Update Student Profile
* **Originating View**: `frontend/src/pages/StudentProfilePage.jsx` Profile Editor Modal (`FR-PROF-02`, `FR-PROF-03`)
* **Endpoint**: `PUT /api/users/profile/me` (or `PUT /api/users/:id`)
* **Access**: Authenticated (Owner only)
* **Request Body**:
  ```json
  {
    "headline": "Full-Stack MERN Developer & Cloud Architect",
    "bio": "Updated biography text...",
    "skills": ["React", "Node.js", "Express", "MongoDB", "Docker"],
    "githubUrl": "https://github.com/NiravGandhi21",
    "linkedinUrl": "https://linkedin.com/in/niravgandhi",
    "portfolioUrl": "https://niravgandhi.dev"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { ...updatedUserRecord }
  }
  ```
* **Error Responses**:
  - `401 Unauthorized` / `403 Forbidden`: User attempting to update another student's profile.

---

## 3. Project Showcase Module (`/api/projects`)

### 3.1 Get Projects Showcase with Search & Filters
* **Originating View**: `frontend/src/pages/ProjectsPage.jsx`, `frontend/src/pages/LandingPage.jsx` (`FR-PROJ-03`)
* **Endpoint**: `GET /api/projects`
* **Access**: Public
* **Query Parameters**:
  - `search` (optional): Query matching `title`, `tagline`, `description`, `techStack`.
  - `tech` (optional): Filter by tech stack tag (e.g. `React`, `Python`).
  - `openOnly` (optional): Boolean `true` to return only projects where `isAcceptingMembers === true`.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "id": "proj_01",
        "title": "EcoTracker — Carbon Footprint Analytics",
        "tagline": "Empowering university campuses to measure, analyze, and offset daily energy consumption.",
        "description": "Full description text...",
        "problemStatement": "University campuses consume significant electricity...",
        "techStack": ["React", "Node.js", "Express", "MongoDB", "TailwindCSS"],
        "githubUrl": "https://github.com/NiravGandhi21/EcoTracker-MERN",
        "liveDemoUrl": "https://ecotracker-demo.vercel.app",
        "isAcceptingMembers": true,
        "requiredRoles": "Frontend UI/UX Designer & Data Visualization Specialist",
        "category": "Web Application / Sustainability",
        "creatorId": "usr_01",
        "creator": {
          "id": "usr_01",
          "name": "Nirav Gandhi",
          "avatar": "https://images.unsplash.com/...",
          "department": "Computer Science & Engineering"
        },
        "memberIds": ["usr_04"],
        "memberCount": 2,
        "createdAt": "2024-11-15T10:00:00Z"
      }
    ]
  }
  ```

---

### 3.2 Get Single Project Showcase Detail
* **Originating View**: `frontend/src/pages/ProjectDetailPage.jsx`, `frontend/src/pages/ProjectFormPage.jsx` (`FR-PROJ-02`)
* **Endpoint**: `GET /api/projects/:id`
* **Access**: Public
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "proj_01",
      "title": "EcoTracker — Carbon Footprint Analytics",
      "tagline": "Empowering university campuses to measure, analyze, and offset daily energy consumption.",
      "description": "Detailed architecture overview...",
      "problemStatement": "Granular energy monitoring is missing...",
      "techStack": ["React", "Node.js", "Express", "MongoDB", "TailwindCSS"],
      "githubUrl": "https://github.com/NiravGandhi21/EcoTracker-MERN",
      "liveDemoUrl": "https://ecotracker-demo.vercel.app",
      "isAcceptingMembers": true,
      "requiredRoles": "Frontend UI/UX Designer",
      "category": "Web Application / Sustainability",
      "creatorId": "usr_01",
      "creator": {
        "id": "usr_01",
        "name": "Nirav Gandhi",
        "avatar": "https://images.unsplash.com/...",
        "department": "Computer Science & Engineering",
        "semester": "6th Semester"
      },
      "memberIds": ["usr_04"],
      "members": [
        {
          "id": "usr_04",
          "name": "Ananya Verma",
          "avatar": "https://images.unsplash.com/...",
          "department": "Computer Science & Engineering"
        }
      ],
      "createdAt": "2024-11-15T10:00:00Z"
    }
  }
  ```
* **Error Responses**:
  - `404 Not Found`: Project not found.

---

### 3.3 Create New Project Showcase
* **Originating View**: `frontend/src/pages/ProjectFormPage.jsx` (`FR-PROJ-01`)
* **Endpoint**: `POST /api/projects`
* **Access**: Authenticated (`Bearer <token>`)
* **Request Body**:
  ```json
  {
    "title": "RoboArm Vision — Kinematic Sorting System",
    "tagline": "Vision-guided robotic arm prototype for automated industrial part sorting.",
    "problemStatement": "Manual sorting is hazardous and error-prone.",
    "description": "A 4-axis robotic arm with OpenCV camera telemetry...",
    "techStack": ["Python", "C++", "IoT", "Arduino"],
    "githubUrl": "https://github.com/rohan-joshi-iot/RoboArm-Vision",
    "liveDemoUrl": "",
    "isAcceptingMembers": true,
    "requiredRoles": "Computer Vision Specialist",
    "category": "Robotics / IoT"
  }
  ```
* **Validation Rules**:
  - `title`: String, required, $\ge 3$ characters.
  - `tagline`: String, required, $\ge 10$ characters.
  - `description`: String, required, $\ge 30$ characters.
  - `githubUrl`: String, required, valid URL format starting with `http://` or `https://`.
  - `techStack`: Array of strings, at least 1 tag required.
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Project showcase published successfully",
    "data": {
      "id": "proj_1740000000",
      "title": "RoboArm Vision — Kinematic Sorting System",
      "creatorId": "67b01a23e4b0a1a2b3c4d5e6",
      "memberIds": [],
      "createdAt": "2025-02-15T10:00:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Field validation error.
  - `401 Unauthorized`: Token missing or expired.

---

### 3.4 Update Project Showcase
* **Originating View**: `frontend/src/pages/ProjectFormPage.jsx` (`FR-PROJ-04`)
* **Endpoint**: `PUT /api/projects/:id`
* **Access**: Authenticated (Creator / Lead only)
* **Request Body**: Partial or complete project object fields.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Project updated successfully",
    "data": { ...updatedProjectRecord }
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Authenticated user is not the creator of this project.
  - `404 Not Found`: Project ID does not exist.

---

### 3.5 Delete Project Showcase
* **Originating View**: `frontend/src/pages/ProjectDetailPage.jsx` (`FR-PROJ-05`)
* **Endpoint**: `DELETE /api/projects/:id`
* **Access**: Authenticated (Creator / Lead only)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Project showcase deleted successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Authenticated user is not the creator.
  - `404 Not Found`.

---

## 4. Collaboration Requests Module (`/api/collaborations`)

### 4.1 Submit Collaboration Join Request
* **Originating View**: `frontend/src/components/cards/CollaborationModal.jsx` (`FR-COLLAB-01`)
* **Endpoint**: `POST /api/collaborations`
* **Access**: Authenticated (`Bearer <token>`)
* **Request Body**:
  ```json
  {
    "projectId": "proj_01",
    "pitchMessage": "Hi Nirav, I saw EcoTracker and loved the sustainability initiative! I have deep experience in Chart.js and Figma and would love to lead the frontend redesign."
  }
  ```
* **Validation & Business Rules**:
  - `pitchMessage`: String, required, 20–500 characters.
  - Project must exist and have `isAcceptingMembers: true`.
  - Applicant cannot be the project creator (`req.user.id !== project.creatorId`).
  - Applicant cannot have an active `Pending` request for this project.
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Collaboration request submitted successfully",
    "data": {
      "id": "collab_1740000000",
      "projectId": "proj_01",
      "applicantId": "usr_02",
      "pitchMessage": "Hi Nirav...",
      "status": "Pending",
      "createdAt": "2025-02-15T10:00:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Pitch too short/long, project closed, self-application, or duplicate pending request.
  - `404 Not Found`: Target project does not exist.

---

### 4.2 Get Incoming Requests for Project Lead
* **Originating View**: `frontend/src/pages/CollaborationsPage.jsx` Tab 1 (`FR-COLLAB-02`)
* **Endpoint**: `GET /api/collaborations/creator`
* **Access**: Authenticated (`Bearer <token>`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "collab_01",
        "projectId": "proj_01",
        "project": {
          "id": "proj_01",
          "title": "EcoTracker — Carbon Footprint Analytics"
        },
        "applicantId": "usr_02",
        "applicant": {
          "id": "usr_02",
          "name": "Priya Patel",
          "avatar": "https://images.unsplash.com/...",
          "department": "Information Technology",
          "semester": "6th Semester",
          "skills": ["React", "UI/UX", "Figma", "Three.js"]
        },
        "pitchMessage": "Hi Nirav, I saw EcoTracker...",
        "status": "Pending",
        "createdAt": "2025-02-10T10:15:00Z"
      }
    ]
  }
  ```

---

### 4.3 Get Sent Applications for Student
* **Originating View**: `frontend/src/pages/CollaborationsPage.jsx` Tab 2 (`FR-COLLAB-04`)
* **Endpoint**: `GET /api/collaborations/applicant`
* **Access**: Authenticated (`Bearer <token>`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "collab_01",
        "projectId": "proj_01",
        "project": {
          "id": "proj_01",
          "title": "EcoTracker — Carbon Footprint Analytics"
        },
        "pitchMessage": "Hi Nirav, I saw EcoTracker...",
        "status": "Pending",
        "createdAt": "2025-02-10T10:15:00Z"
      }
    ]
  }
  ```

---

### 4.4 Check Existing Request Status
* **Originating View**: `frontend/src/pages/ProjectDetailPage.jsx` (`FR-COLLAB-01`)
* **Endpoint**: `GET /api/collaborations/check/:projectId`
* **Access**: Authenticated (`Bearer <token>`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "existingRequest": {
        "id": "collab_01",
        "status": "Pending"
      }
    }
  }
  ```
  *(Returns `"existingRequest": null` if no request exists).*

---

### 4.5 Update Collaboration Request Status (Accept / Decline)
* **Originating View**: `frontend/src/pages/CollaborationsPage.jsx` (`FR-COLLAB-03`, `FR-COLLAB-05`)
* **Endpoint**: `PUT /api/collaborations/:id/status`
* **Access**: Authenticated (Target project creator only)
* **Request Body**:
  ```json
  {
    "status": "Accepted"
  }
  ```
  *(Valid values: `"Accepted"`, `"Declined"`)*
* **Atomic Business Logic**:
  - When `"Accepted"`: Atomically appends `applicantId` to `Project.members` array.
  - When `"Declined"`: Request status marked `Declined`, project roster remains unchanged.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Collaborator accepted and added to roster",
    "data": {
      "id": "collab_01",
      "status": "Accepted",
      "updatedAt": "2025-02-15T10:30:00.000Z"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Invalid status transition.
  - `403 Forbidden`: Authenticated user is not the lead of the target project.
  - `404 Not Found`: Request not found.

---

## 5. System Health Check (`/api/health`)

### 5.1 Server & Health Diagnostic
* **Endpoint**: `GET /api/health`
* **Access**: Public
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "status": "ok",
    "timestamp": "2025-02-15T10:30:00.000Z",
    "uptime": 142.5,
    "environment": "development"
  }
  ```
