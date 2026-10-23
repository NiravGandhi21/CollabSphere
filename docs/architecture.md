# CollabSphere: Backend System Architecture

> **Document Version:** 1.0.0  
> **Pattern:** Modular Monolith (Node.js + Express.js ES Modules)  
> **Database:** MongoDB Atlas (Mongoose ODM)  
> **Security Baseline:** JWT Bearer Authentication, bcryptjs password hashing, Centralized Error Handling, CORS Whitelisting

---

## 1. High-Level Architecture Overview

CollabSphere is architected as an industry-standard decoupled client-server web platform:

```text
┌────────────────────────────────────────────────────────┐
│                   CollabSphere Client                  │
│       React.js (Vite) + React Router + Modern CSS      │
│     (frontend/src/services/ -> HTTP fetch calls)       │
└───────────────────────────┬────────────────────────────┘
                            │ RESTful JSON APIs (HTTP / HTTPS)
                            │ Bearer <token> in Authorization Header
┌───────────────────────────▼────────────────────────────┐
│                   CollabSphere Server                  │
│              Express.js Modular Monolith               │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    Middleware                    │  │
│  │   • CORS • express.json() • Morgan Request Log   │  │
│  │   • authMiddleware (JWT verify & req.user)       │  │
│  │   • validateRequest (Joi / Validator checks)     │  │
│  │   • Centralized errorHandler (JSON envelope)     │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             │                          │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │               Controllers & Services             │  │
│  │   • Auth Module (Register, Login, Me)            │  │
│  │   • Users Module (Profiles, Directory, Skills)   │  │
│  │   • Projects Module (Showcases, CRUD, Tags)      │  │
│  │   • Collaborations Module (Pitches, Inboxes)     │  │
│  └──────────────────────────┬───────────────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │ Mongoose ODM v8
┌─────────────────────────────▼──────────────────────────┐
│                  CollabSphere Database                 │
│                 MongoDB Atlas Cluster                  │
│  • users (hashed passwords, skills, university dept)   │
│  • projects (creatorId, memberIds, techStack, links)   │
│  • collaborationrequests (project, applicant, pitch)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Request Lifecycle: End-to-End Walkthrough

Every incoming HTTP request traverses a clean, single-responsibility pipeline:

```text
[ React Component ]
       │
       ▼
[ Frontend API Service (src/services/api.js) ]
       │ (dispatches HTTP GET/POST/PUT/DELETE with Bearer token)
       ▼
[ Express Router (backend/src/routes/*.routes.js) ]
       │
       ▼
[ Security & Auth Middleware (backend/src/middleware/auth.js) ]
       │ (Verifies JWT signature, extracts payload, attaches req.user)
       ▼
[ Request Validation Middleware (backend/src/middleware/validate.js) ]
       │ (Verifies payload length, required fields, data types)
       ▼
[ Controller Handler (backend/src/controllers/*.controller.js) ]
       │ (Extracts params, calls Service layer, prepares HTTP response)
       ▼
[ Service / Data Layer (backend/src/services/* or Mongoose Models) ]
       │ (Executes atomic business logic & MongoDB Atlas queries)
       ▼
[ JSON Response / Centralized Error Middleware ]
       │ (Formats response into standard { success, data } envelope)
       ▼
[ React Component updates state & renders UI ]
```

---

## 3. Directory Layout (`backend/`)

```text
backend/
├── package.json               # Node.js ES Modules ("type": "module")
├── .env.example               # Template for required environment variables
├── .env                       # Local secrets (NEVER committed to git)
├── server.js                  # Entry point: starts HTTP listener, connects to DB
├── src/
│   ├── app.js                 # Express app initialization, middleware, route mounting
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection lifecycle & reconnect handlers
│   │   └── env.js             # Validated environment configuration defaults
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & role protection middleware
│   │   ├── error.js           # Centralized 404 & 500 error handling middleware
│   │   └── validate.js        # Request schema & payload validation utility
│   ├── modules/ (or controllers & routes)
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   └── auth.controller.js
│   │   ├── users/
│   │   │   ├── user.routes.js
│   │   │   └── user.controller.js
│   │   ├── projects/
│   │   │   ├── project.routes.js
│   │   │   └── project.controller.js
│   │   └── collaborations/
│   │       ├── collaboration.routes.js
│   │       └── collaboration.controller.js
│   ├── models/                # Mongoose Models (Schemas, hooks, indexes)
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── CollaborationRequest.js
│   └── utils/
│       ├── apiResponse.js     # Standardized JSON response envelope helpers
│       └── logger.js          # Clean console/logging utility
└── tests/                     # Automated HTTP endpoint integration tests
    ├── health.test.js
    ├── auth.test.js
    └── projects.test.js
```

---

## 4. Security & Data Protection Strategy

1. **Password Hashing**: `bcryptjs` with salt work factor $\ge 10$ executed inside Mongoose pre-save hooks. Passwords are never returned in JSON queries (`select: false`).
2. **Stateless JWT Authentication**: Tokens signed with an HMAC-SHA256 secret key stored exclusively in server environment variables with a 7-day expiration window.
3. **CORS Whitelisting**: Restricted in production to the frontend origin (e.g. `http://localhost:5173` or Vercel client domains).
4. **Ownership Verification**: Endpoints updating or deleting resources verify that `req.user.id` equals the document's creator ID, returning `403 Forbidden` if unauthorized.
5. **NoSQL Injection Prevention**: Mongoose strict schemas prevent prototype pollution and arbitrary MongoDB query injection.

---

## 5. Centralized Error Handling

All unhandled exceptions and operational errors pass to the Express error middleware:

```javascript
// Example Standardized Error JSON
{
  "success": false,
  "message": "Resource not found",
  "stack": "..." // Only present when NODE_ENV === 'development'
}
```
Operational errors use a custom `AppError` class carrying an HTTP status code, preventing unhandled promise rejections and server process terminations.
