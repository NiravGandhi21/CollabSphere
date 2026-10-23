import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupTestDB, clearTestDB, teardownTestDB } from './setup.js';
import { User } from '../models/User.js';
import { app } from '../server.js';

describe('User Model & Authentication Persistence Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
    await User.init(); // Ensure unique indexes are built
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  // ── Schema Validation ────────────────────────────────────────────────────────
  it('should create a valid student user document with hashed password', async () => {
    const user = await User.create({
      name: 'Nirav Gandhi',
      email: 'NIRAV.GANDHI@ITMUNIVERSITY.AC.IN',
      passwordHash: 'plainPassword123',
      department: 'Computer Science & Engineering',
      graduationYear: 2026,
      skills: ['React', 'Node.js', 'MongoDB'],
    });

    expect(user._id).toBeDefined();
    // Email should be normalized to lowercase
    expect(user.email).toBe('nirav.gandhi@itmuniversity.ac.in');
    // Pre-save hook should have hashed the password
    expect(user.passwordHash).not.toBe('plainPassword123');
    expect(user.passwordHash.startsWith('$2')).toBe(true);

    // Password comparison should succeed
    const isMatch = await user.comparePassword('plainPassword123');
    expect(isMatch).toBe(true);

    const isWrongMatch = await user.comparePassword('wrongPassword');
    expect(isWrongMatch).toBe(false);
  });

  it('should reject user creation when required fields are missing', async () => {
    await expect(
      User.create({
        email: 'test@example.com',
      })
    ).rejects.toThrow();
  });

  it('should accept "Computer Science & Engineering" as a valid department', async () => {
    const user = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@itmuniversity.ac.in',
      passwordHash: 'password123',
      department: 'Computer Science & Engineering',
    });

    expect(user.department).toBe('Computer Science & Engineering');
  });

  it('should enforce unique email constraint at the database level', async () => {
    await User.create({
      name: 'First Student',
      email: 'student@example.com',
      passwordHash: 'password123',
      department: 'Information Technology',
    });

    // Attempt to register duplicate email (even with different casing)
    await expect(
      User.create({
        name: 'Second Student',
        email: 'STUDENT@EXAMPLE.COM',
        passwordHash: 'password123',
        department: 'Computer Science & Engineering',
      })
    ).rejects.toThrow();
  });

  it('should exclude passwordHash from JSON serialization and default queries', async () => {
    const created = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@itmuniversity.ac.in',
      passwordHash: 'secretPassword',
      department: 'Information Technology',
    });

    // Query without explicit select
    const fetched = await User.findById(created._id);
    expect(fetched.passwordHash).toBeUndefined();

    // toJSON transform
    const json = fetched.toJSON();
    expect(json.id).toBe(created._id.toString());
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.passwordHash).toBeUndefined();
  });

  // ── API Endpoints ────────────────────────────────────────────────────────────
  it('POST /api/auth/register should register user, return JWT, and omit passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rohan Joshi',
        email: 'rohan.joshi@itmuniversity.ac.in',
        password: 'securePassword123',
        department: 'Mechanical Engineering',
        graduationYear: 2026,
        semester: '6th Semester',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('rohan.joshi@itmuniversity.ac.in');
    expect(res.body.user.passwordHash).toBeUndefined();

    // Verify record in database
    const dbUser = await User.findOne({ email: 'rohan.joshi@itmuniversity.ac.in' });
    expect(dbUser).not.toBeNull();
  });

  it('POST /api/auth/register should return 400 on duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rohan Joshi',
        email: 'rohan.joshi@itmuniversity.ac.in',
        password: 'securePassword123',
        department: 'Mechanical Engineering',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rohan Duplicate',
        email: 'rohan.joshi@itmuniversity.ac.in',
        password: 'securePassword123',
        department: 'Mechanical Engineering',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already registered');
  });

  it('POST /api/auth/login should authenticate valid user and reject invalid password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ananya Verma',
        email: 'ananya.verma@itmuniversity.ac.in',
        password: 'correctPassword',
        department: 'Computer Science & Engineering',
      });

    // Valid login
    const validRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ananya.verma@itmuniversity.ac.in',
        password: 'correctPassword',
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.token).toBeDefined();
    expect(validRes.body.user.name).toBe('Ananya Verma');

    // Invalid login
    const invalidRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ananya.verma@itmuniversity.ac.in',
        password: 'wrongPassword',
      });

    expect(invalidRes.status).toBe(401);
    expect(invalidRes.body.message).toBe('Invalid email or password');
  });
});
