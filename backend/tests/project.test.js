import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Collaboration } from '../models/Collaboration.js';
import { app } from '../server.js';
import { signToken } from '../utils/jwt.js';

describe('Project Model & Cascade Deletion Persistence Tests', () => {
  let leadUser, leadToken, collaboratorUser, otherUser, otherToken;

  beforeAll(async () => {
    await setupTestDB();
    await Project.init();
    await Collaboration.init();
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

    collaboratorUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash: 'password123',
      department: 'Information Technology',
    });

    otherUser = await User.create({
      name: 'Stranger User',
      email: 'stranger@example.com',
      passwordHash: 'password123',
      department: 'Civil Engineering',
    });
    otherToken = signToken({ id: otherUser._id.toString(), role: otherUser.role });
  });

  it('should create a valid project showcase referencing creator', async () => {
    const project = await Project.create({
      title: 'EcoTracker',
      tagline: 'Campus carbon footprint analytics.',
      description: 'An advanced IoT sustainability platform for engineering campuses.',
      techStack: ['React', 'Node.js', 'MongoDB'],
      githubUrl: 'https://github.com/NiravGandhi21/EcoTracker-MERN',
      isAcceptingMembers: true,
      creatorId: leadUser._id,
      memberIds: [collaboratorUser._id],
    });

    expect(project._id).toBeDefined();
    expect(project.creatorId.toString()).toBe(leadUser._id.toString());
    expect(project.memberIds.length).toBe(1);
    expect(project.memberIds[0].toString()).toBe(collaboratorUser._id.toString());
  });

  it('should enforce roster uniqueness and reject duplicate members in memberIds', async () => {
    await expect(
      Project.create({
        title: 'Duplicate Team Project',
        description: 'Test project with invalid duplicate roster.',
        githubUrl: 'https://github.com/example/dup',
        creatorId: leadUser._id,
        memberIds: [collaboratorUser._id, collaboratorUser._id], // Duplicate!
      })
    ).rejects.toThrow();
  });

  it('should reject creator being added into the memberIds roster', async () => {
    await expect(
      Project.create({
        title: 'Self-member Project',
        description: 'Test project where creator tries to join own roster.',
        githubUrl: 'https://github.com/example/self',
        creatorId: leadUser._id,
        memberIds: [leadUser._id], // Creator cannot be in memberIds!
      })
    ).rejects.toThrow();
  });

  it('GET /api/projects should filter projects by technology stack and open recruitment status', async () => {
    await Project.create({
      title: 'React Open Project',
      description: 'Accepting members for React development.',
      techStack: ['React', 'TypeScript'],
      githubUrl: 'https://github.com/example/react',
      isAcceptingMembers: true,
      creatorId: leadUser._id,
    });

    await Project.create({
      title: 'React Closed Project',
      description: 'Team full React project.',
      techStack: ['React'],
      githubUrl: 'https://github.com/example/react-closed',
      isAcceptingMembers: false,
      creatorId: leadUser._id,
    });

    await Project.create({
      title: 'Python ML Project',
      description: 'Machine learning prototype.',
      techStack: ['Python', 'PyTorch'],
      githubUrl: 'https://github.com/example/python',
      isAcceptingMembers: true,
      creatorId: leadUser._id,
    });

    // Query 1: tech=React
    const resReact = await request(app).get('/api/projects?tech=React');
    expect(resReact.status).toBe(200);
    expect(resReact.body.length).toBe(2);

    // Query 2: tech=React & openOnly=true
    const resOpen = await request(app).get('/api/projects?tech=React&openOnly=true');
    expect(resOpen.status).toBe(200);
    expect(resOpen.body.length).toBe(1);
    expect(resOpen.body[0].title).toBe('React Open Project');
  });

  it('PUT /api/projects/:id should block unauthorized non-creators with 403', async () => {
    const project = await Project.create({
      title: 'Lead Project',
      description: 'Authored by Nirav.',
      githubUrl: 'https://github.com/example/lead',
      creatorId: leadUser._id,
    });

    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Unauthorized');
  });

  it('DELETE /api/projects/:id should permanently remove showcase and cascade delete associated collaborations (FR-PROJ-05)', async () => {
    const project = await Project.create({
      title: 'Project to Delete',
      description: 'Will be deleted along with all its requests.',
      githubUrl: 'https://github.com/example/del',
      isAcceptingMembers: true,
      creatorId: leadUser._id,
    });

    // Create 2 collaboration requests targeting this project
    await Collaboration.create({
      projectId: project._id,
      applicantId: collaboratorUser._id,
      pitchMessage: 'I want to help with frontend architecture.',
      status: 'Pending',
    });

    await Collaboration.create({
      projectId: project._id,
      applicantId: otherUser._id,
      pitchMessage: 'I can help with backend microservices testing.',
      status: 'Accepted',
    });

    expect(await Collaboration.countDocuments({ projectId: project._id })).toBe(2);

    // Attempt delete with unauthorized user -> 403
    const unauthRes = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(unauthRes.status).toBe(403);
    expect(await Project.countDocuments({ _id: project._id })).toBe(1);

    // Delete with authorized creator -> 200
    const authRes = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${leadToken}`);
    expect(authRes.status).toBe(200);

    // Verify Project is removed from database
    const dbProject = await Project.findById(project._id);
    expect(dbProject).toBeNull();

    // Verify cascade deletion: associated collaborations are removed
    const remainingCollabs = await Collaboration.find({ projectId: project._id });
    expect(remainingCollabs.length).toBe(0);
  });
});
