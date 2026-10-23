import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Collaboration } from '../models/Collaboration.js';
import { app } from '../server.js';
import { signToken } from '../utils/jwt.js';

describe('Phase 4 Integration Fixes & Regression Tests', () => {
  let leadUser, leadToken;
  let applicantUser, applicantToken;
  let projectA;

  beforeAll(async () => {
    await setupTestDB();
    await Project.init();
    await Collaboration.init();
    await User.init();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    leadUser = await User.create({
      name: 'Nirav Gandhi',
      email: 'nirav@example.com',
      passwordHash: 'password123',
      department: 'Computer Science & Engineering',
      skills: ['React', 'Node.js'],
    });
    leadToken = signToken({ id: leadUser._id.toString(), role: leadUser.role });

    applicantUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash: 'password123',
      department: 'Information Technology',
      skills: ['Three.js', 'UI/UX'],
    });
    applicantToken = signToken({ id: applicantUser._id.toString(), role: applicantUser.role });

    projectA = await Project.create({
      title: 'CollabSphere Phase 4',
      description: 'Full-stack integration testing showcase.',
      techStack: ['React', 'Express', 'MongoDB'],
      githubUrl: 'https://github.com/example/collabsphere',
      isAcceptingMembers: true,
      creatorId: leadUser._id,
      memberIds: [],
    });

    // Create a pending collaboration from applicantUser to projectA
    await Collaboration.create({
      projectId: projectA._id,
      applicantId: applicantUser._id,
      pitchMessage: 'Interested in building the responsive frontend.',
      status: 'Pending',
    });
  });

  // ── FIX 1: Collaboration Route Aliases ──────────────────────────────────────
  describe('Fix 1: Collaboration Route Aliases (/creator & /incoming, /applicant & /outgoing)', () => {
    it('GET /api/collaborations/incoming should return incoming applications for project lead', async () => {
      const res = await request(app)
        .get('/api/collaborations/incoming')
        .set('Authorization', `Bearer ${leadToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].applicant.name).toBe('Priya Patel');
    });

    it('GET /api/collaborations/creator (alias) should return identical results as /incoming', async () => {
      const res = await request(app)
        .get('/api/collaborations/creator')
        .set('Authorization', `Bearer ${leadToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].applicant.name).toBe('Priya Patel');
    });

    it('GET /api/collaborations/outgoing should return applications submitted by current user', async () => {
      const res = await request(app)
        .get('/api/collaborations/outgoing')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].project.title).toBe('CollabSphere Phase 4');
    });

    it('GET /api/collaborations/applicant (alias) should return identical results as /outgoing', async () => {
      const res = await request(app)
        .get('/api/collaborations/applicant')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].project.title).toBe('CollabSphere Phase 4');
    });

    it('Incoming requests should be isolated to lead and not expose requests of other users', async () => {
      // Applicant should see 0 incoming requests since they are not a project lead
      const res = await request(app)
        .get('/api/collaborations/creator')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  // ── FIX 2: Profile Update Response & Normalization ──────────────────────────
  describe('Fix 2: Profile Update Response & Normalization', () => {
    it('PUT /api/users/:id should return canonical envelope with both top-level and nested user', async () => {
      const res = await request(app)
        .put(`/api/users/${leadUser._id}`)
        .set('Authorization', `Bearer ${leadToken}`)
        .send({
          headline: 'Full-Stack Systems Architect & Lead',
          bio: 'Updated bio during Phase 4 integration test.',
          skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Both flat keys and user key exist for seamless backward-compatibility
      expect(res.body.user).toBeDefined();
      expect(res.body.user.headline).toBe('Full-Stack Systems Architect & Lead');
      expect(res.body.headline).toBe('Full-Stack Systems Architect & Lead');
      expect(res.body.skills).toContain('Docker');

      // Database verification
      const dbUser = await User.findById(leadUser._id);
      expect(dbUser.headline).toBe('Full-Stack Systems Architect & Lead');
    });

    it('PUT /api/users/profile/me (alias) should update current authenticated user without ID in path', async () => {
      const res = await request(app)
        .put('/api/users/profile/me')
        .set('Authorization', `Bearer ${leadToken}`)
        .send({
          headline: 'Self Updated Via Me Route',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.headline).toBe('Self Updated Via Me Route');
    });

    it('PUT /api/users/:id should reject unauthorized user attempting to edit another profile', async () => {
      const res = await request(app)
        .put(`/api/users/${leadUser._id}`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ headline: 'Hacked headline' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Unauthorized');
    });
  });

  // ── FIX 3: Invalid & Expired Token Rejection ────────────────────────────────
  describe('Fix 3: Session Security & Expired Token Handling', () => {
    it('GET /api/auth/me should reject expired or invalid JWT with 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.expired');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid or expired session');
    });

    it('GET /api/auth/me should return authenticated user profile on valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${leadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('nirav@example.com');
      expect(res.body.user.passwordHash).toBeUndefined();
    });
  });
});
