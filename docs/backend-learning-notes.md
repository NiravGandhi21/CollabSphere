# CollabSphere: Backend Database & Persistence Engineering Notes

> **Document Version:** 1.0.0  
> **Topic:** MongoDB Atlas, Mongoose ODM, Data Integrity, and Persistence Testing  
> **Target Audience:** Engineering Students, Reviewers, and Viva Voce Examiners  

---

## 1. Mongoose Schemas & Models

In MongoDB, data is natively schema-adaptive (BSON documents). While flexible, production web applications require structure, validation, type safety, and default values. 

* **Mongoose Schema**: The architectural blueprint defining document structure, data types, constraints (e.g. `minlength`, `required`), default values, lifecycle middleware (`pre`/`post` hooks), and instance methods.
* **Mongoose Model**: A compiled wrapper over the schema providing an interface for querying, inserting, updating, and deleting documents in a specific MongoDB collection.

```javascript
// Schema Definition
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true }
}, { timestamps: true });

// Model Compilation
export const User = mongoose.model('User', userSchema);
```

---

## 2. Document References & `populate()`

Rather than deeply embedding entire objects or duplicating student profiles across every project showcase, CollabSphere uses **normalized references**:

```javascript
// In Project.js
creatorId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
}
```

### Why References?
* **Zero Data Staleness**: When a student updates their avatar or department, any project showcase referencing them reflects the update immediately.
* **Controlled Payload Size**: Avoids unbounded document growth as teams expand.

### How `populate()` Operates
`populate()` performs an optimized secondary batch lookup behind the scenes:
```javascript
const project = await Project.findById(id).populate('creatorId', 'name avatar department');
```
MongoDB fetches the project document, extracts `creatorId`, queries the `users` collection for matching IDs, and replaces the `ObjectId` scalar with the populated user subdocument.

---

## 3. Database Indexes

Indexes are specialized B-tree data structures that order document keys, enabling logarithmic search $O(\log N)$ instead of full collection scans $O(N)$ (`COLLSCAN`).

### 3.1 Unique Indexes
* **Defined**: `{ email: 1 }` with `{ unique: true }`.
* **Purpose**: Enforces record uniqueness at the database engine level, rejecting duplicate records even under high concurrent load.

### 3.2 Multikey Indexes (Arrays)
* **Defined**: `{ skills: 1 }` on `User` and `{ techStack: 1 }` on `Project`.
* **Purpose**: When an indexed field is an array, MongoDB creates an index entry for every individual element in the array. This allows instant filtering of students by individual skill tag (e.g., `skills: "React"`).

### 3.3 Compound Indexes
* **Defined**: `{ techStack: 1, isAcceptingMembers: 1 }` on `Project`.
* **Index Prefix Rule**: Compound indexes satisfy queries filtering on `techStack` alone, or both `techStack` and `isAcceptingMembers`.

---

## 4. Partial Unique Indexes

Requirement `FR-COLLAB-01` specifies that a student cannot submit duplicate active requests to the same project, but should be allowed to reapply if an earlier request was `Declined`.

A standard unique index on `{ projectId, applicantId }` would permanently block a student from ever applying again.

**Solution: MongoDB Partial Unique Index**:
```javascript
collaborationSchema.index(
  { projectId: 1, applicantId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Pending' }
  }
);
```
* **How it works**: The uniqueness constraint is applied **only to documents matching the filter expression** (`status === 'Pending'`).
* If a student already has a `Pending` request for Project A, any second `Pending` request triggers MongoDB error code `11000`.
* Once the request status changes to `Declined`, the partial filter no longer applies, allowing the student to submit a fresh application.

---

## 5. Security & Password-Hash Protection

Plaintext passwords must never be stored, logged, or serialized into API responses.

1. **Pre-Save Hashing Hook**:
   ```javascript
   userSchema.pre('save', async function (next) {
     if (!this.isModified('passwordHash')) return next();
     this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
     next();
   });
   ```
2. **Query Exclusion (`select: false`)**:
   In the schema, `passwordHash` is marked `select: false`. Standard `User.find()` or `User.findById()` queries omit the hash by default.
3. **Serialization Stripping (`toJSON`)**:
   Mongoose `toJSON` and `toObject` transforms explicitly delete `passwordHash`, `_id`, and `__v`, returning a clean `id` string for frontend consumption:
   ```javascript
   transform(_doc, ret) {
     ret.id = ret._id.toString();
     delete ret._id;
     delete ret.__v;
     delete ret.passwordHash;
     return ret;
   }
   ```

---

## 6. MongoDB Transactions & Deployment Requirements

A **Multi-Document ACID Transaction** ensures that multiple write operations across different collections succeed together or fail together without partial state changes.

### Deployment Requirement
* **Replica Set Required**: Multi-document transactions (`session.startTransaction()`) **require** a MongoDB Replica Set (such as MongoDB Atlas 3-node clusters) or a sharded cluster (`mongos`). Standalone MongoDB instances (like default local single-node installations or basic test doubles) throw:
  `Transaction numbers are only allowed on a replica set member or mongos`

### CollabSphere's Deployment-Adaptive Cascade Deletion
In `backend/controllers/project.controller.js`, when a project is deleted:
1. The controller attempts a transaction session.
2. If the deployment is a replica set (Atlas), operations execute atomically inside the transaction.
3. If transactions are unsupported (standalone development or memory server), the controller safely falls back to defensive sequential cascade deletion:
   ```javascript
   await Collaboration.deleteMany({ projectId: project._id });
   await project.deleteOne();
   ```

---

## 7. Race Conditions & Collaboration Consistency

When a project lead approves a join request, two actions must occur:
1. Update `Collaboration.status` to `'Accepted'`.
2. Add `applicantId` to `Project.memberIds`.

### Potential Race Conditions Handled
1. **Double Approval / State Modification Race**:
   If a lead double-clicks "Accept", or two concurrent network requests hit the endpoint:
   ```javascript
   // Conditional atomic update
   const updated = await Collaboration.findOneAndUpdate(
     { _id: request._id, status: 'Pending' },
     { $set: { status: 'Accepted' } },
     { new: true }
   );
   ```
   If the status was already changed by a concurrent request, `updated` returns `null`, and the server returns HTTP `409 Conflict` or `400 Bad Request` rather than corrupting state.

2. **Roster Duplication**:
   Instead of using `$push`, CollabSphere uses `$addToSet`:
   ```javascript
   await Project.findByIdAndUpdate(request.projectId, {
     $addToSet: { memberIds: request.applicantId }
   });
   ```
   MongoDB's `$addToSet` treats the array as a mathematical set, guaranteeing zero duplicate entries in the team roster.

---

## 8. Database Connection States

Mongoose tracks connection lifecycle via `mongoose.connection.readyState`:
* `0`: Disconnected
* `1`: Connected
* `2`: Connecting
* `3`: Disconnecting

The health endpoint `GET /api/health` queries this state dynamically:
```json
{
  "status": "ok",
  "service": "CollabSphere API",
  "database": "connected",
  "timestamp": "2026-10-21T22:55:00.000Z"
}
```

---

## 9. How to Debug Database Errors

### 1. Duplicate Key Error (`E11000`)
* **Cause**: Attempting to insert a document with a value that already exists in a unique index (e.g. duplicate `email` or duplicate `Pending` collaboration).
* **Investigation**: Check `err.keyValue` or `err.keyPattern`. The CollabSphere centralized error handler automatically catches `err.code === 11000` and translates it into user-friendly messages:
  `"Email is already registered. Please sign in instead."` or
  `"You already have a pending request for this project."`

### 2. Validation Error (`ValidationError`)
* **Cause**: Value violates schema constraints (e.g. pitch message $< 20$ characters, invalid email format, missing required field).
* **Investigation**: Inspect `err.errors[field].message`. CollabSphere returns HTTP `400 Bad Request` with joined error messages.

### 3. CastError (`CastError`)
* **Cause**: Passing an invalid hex string as an ObjectId (e.g. `/api/projects/abc123invalid`).
* **Investigation**: CollabSphere catches `err.name === 'CastError'` and returns HTTP `400` with `"Invalid identifier format"`.

---

## 10. Running Automated Persistence Tests

Persistence tests run in complete isolation using `mongodb-memory-server` without touching external networks or Atlas credentials:

```bash
cd backend
npm test
```

### Test Coverage Highlights
* **`tests/user.test.js`** (8 tests): Password hashing, email normalization, duplicate email rejection, department validation.
* **`tests/project.test.js`** (6 tests): Roster uniqueness, techStack filtering, ownership enforcement, cascade deletion (FR-PROJ-05).
* **`tests/collaboration.test.js`** (9 tests): Partial unique indexes, reapplication after decline, lead authorization, atomic `$addToSet` roster sync.
* **`tests/api.test.js`** (6 tests): Health diagnostics, CastError handling, 401 token authentication, 404 handlers.
