import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Collaboration } from '../models/Collaboration.js';
import { app } from '../server.js';
import { signToken } from '../utils/jwt.js';

describe('Collaboration Model, Partial Unique Index & Status Hardening Tests', () => {
  let leadUser, leadToken;
  let applicantUser, applicantToken;
  let otherUser, otherToken;
  let openProject, closedProject;

  beforeAll(async () => {
    await setupTestDB();
    await Project.init();
    await Collaboration.init(); // Builds partial unique index on { projectId, applicantId }
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
    });
    leadToken = signToken({ id: leadUser._id.toString(), role: leadUser.role });

    applicantUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash: 'password123',
      department: 'Information Technology',
    });
    applicantToken = signToken({ id: applicantUser._id.toString(), role: applicantUser.role });

    otherUser = await User.create({
      name: 'Unauthorized User',
      email: 'unauth@example.com',
      passwordHash: 'password123',
      department: 'Civil Engineering',
    });
    otherToken = signToken({ id: otherUser._id.toString(), role: otherUser.role });

    openProject = await Project.create({
      title: 'Open Capstone Showcase',
      description: 'Actively recruiting frontend developers.',
      techStack: ['React', 'CSS'],
      githubUrl: 'https://github.com/example/open',
      isAcceptingMembers: true,
      creatorId: leadUser._id,
      memberIds: [],
    });

    closedProject = await Project.create({
      title: 'Closed Project Showcase',
      description: 'Team already filled to capacity.',
      techStack: ['Python'],
      githubUrl: 'https://github.com/example/closed',
      isAcceptingMembers: false,
      creatorId: leadUser._id,
      memberIds: [],
    });
  });

  it('POST /api/collaborations should create a valid Pending request', async () => {
    const res = await request(app)
      .post('/api/collaborations')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({
        projectId: openProject._id.toString(),
        pitchMessage: 'I have extensive experience with React animations and responsive CSS design.',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('Pending');
    expect(res.body.applicant.name).toBe('Priya Patel');
    expect(res.body.project.title).toBe('Open Capstone Showcase');
  });

  it('POST /api/collaborations should reject pitch messages shorter than 20 characters', async () => {
    const res = await request(app)
      .post('/api/collaborations')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({
        projectId: openProject._id.toString(),
        pitchMessage: 'Too short',
      });

    expect(res.status).toBe(422); // Zod validation failure
  });

  it('POST /api/collaborations should prevent creator from submitting a request to own project', async () => {
    const res = await request(app)
      .post('/api/collaborations')
      .set('Authorization', `Bearer ${leadToken}`)
      .send({
        projectId: openProject._id.toString(),
        pitchMessage: 'Trying to apply to my own project showcase here.',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Cannot submit a collaboration request to your own project');
  });

  it('POST /api/collaborations should reject requests to closed projects', async () => {
    const res = await request(app)
      .post('/api/collaborations')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({
        projectId: closedProject._id.toString(),
        pitchMessage: 'I want to join this closed project showcase please.',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('not currently accepting new members');
  });

  it('should enforce database-level partial unique index preventing duplicate Pending requests', async () => {
    // First Pending request
    await Collaboration.create({
      projectId: openProject._id,
      applicantId: applicantUser._id,
      pitchMessage: 'First application pitch for this capstone project.',
      status: 'Pending',
    });

    // Second Pending request directly to DB should violate partial unique index
    await expect(
      Collaboration.create({
        projectId: openProject._id,
        applicantId: applicantUser._id,
        pitchMessage: 'Duplicate pending pitch from same student.',
        status: 'Pending',
      })
    ).rejects.toThrow();
  });

  it('should allow reapplication after previous request was Declined', async () => {
    // Prior request that was Declined
    await Collaboration.create({
      projectId: openProject._id,
      applicantId: applicantUser._id,
      pitchMessage: 'First pitch that was unfortunately declined.',
      status: 'Declined',
    });

    // Re-applying with a new Pending request should succeed because partial index only filters status == "Pending"
    const newRequest = await Collaboration.create({
      projectId: openProject._id,
      applicantId: applicantUser._id,
      pitchMessage: 'Second improved pitch highlighting my new GitHub projects.',
      status: 'Pending',
    });

    expect(newRequest._id).toBeDefined();
    expect(newRequest.status).toBe('Pending');
  });

  it('PUT /api/collaborations/:id/status should block non-leads with 403', async () => {
    const collab = await Collaboration.create({
      projectId: openProject._id,
      applicantId: applicantUser._id,
      pitchMessage: 'Valid pitch message to test unauthorized access.',
      status: 'Pending',
    });

    const res = await request(app)
      .put(`/api/collaborations/${collab._id}/status`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ status: 'Accepted' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Unauthorized: Only the project lead can accept or decline');
  });

  it('PUT /api/collaborations/:id/status should atomically accept request and add applicant to project roster ($addToSet)', async () => {
    const collab = await Collaboration.create({
      projectId: openProject._id,
      applicantId: applicantUser._id,
      pitchMessage: 'Application waiting for lead acceptance.',
      status: 'Pending',
    });

    const res = await request(app)
      .put(`/api/collaborations/${collab._id}/status`)
      .set('Authorization', `Bearer ${leadToken}`)
      .send({ status: 'Accepted' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Accepted');

    // Verify collaboration status in database
    const dbCollab = await Collaboration.findById(collab._id);
    expect(dbCollab.status).toBe('Accepted');

    // Verify project roster was atomically updated with applicant's user ID
    const dbProject = await Project.findById(openProject._id);
    expect(dbProject.memberIds.map((id) => id.toString())).toContain(applicantUser._id.toString());

    // Repeating the approval attempt should return 400 (request is already processed)
    const repeatRes = await request(app)
      .put(`/api/collaborations/${collab._id}/status`)
      .set('Authorization', `Bearer ${leadToken}`)
      .send({ status: 'Accepted' });

    expect(repeatRes.status).toBe(400);
    expect(repeatRes.body.message).toContain('already been accepted');
  });

  it('PUT /api/collaborations/:id/status when Declined should update status without modifying roster', async () => {
    const collab = await Collaboration.create({
      projectId: openProject._id,
      applicantId: applicantUser._id,
      pitchMessage: 'Application waiting to be declined.',
      status: 'Pending',
    });

    const res = await request(app)
      .put(`/api/collaborations/${collab._id}/status`)
      .set('Authorization', `Bearer ${leadToken}`)
      .send({ status: 'Declined' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Declined');

    // Project roster should remain empty
    const dbProject = await Project.findById(openProject._id);
    expect(dbProject.memberIds.length).toBe(0);
  });
});
