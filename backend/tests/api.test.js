import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestDB, teardownTestDB } from './setup.js';
import { app } from '../server.js';

describe('API Diagnostics, Error Envelopes & CastError Handling', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('GET /api/health should report server and database connectivity status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('CollabSphere API');
    expect(res.body.database).toBe('connected');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/projects/:invalidId should handle CastError and return 400 without crashing', async () => {
    const res = await request(app).get('/api/projects/not-a-valid-mongodb-id');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid identifier format');
  });

  it('GET /api/users/:invalidId should handle CastError and return 400 without crashing', async () => {
    const res = await request(app).get('/api/users/not-a-valid-mongodb-id');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid identifier format');
  });

  it('Protected routes should reject requests missing Authorization header with 401', async () => {
    const res = await request(app).get('/api/collaborations/incoming');

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Authentication required');
  });

  it('Protected routes should reject invalid/tampered JWT tokens with 401', async () => {
    const res = await request(app)
      .get('/api/collaborations/incoming')
      .set('Authorization', 'Bearer invalid.tampered.token');

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid or expired session');
  });

  it('Unknown routes should return 404 JSON response', async () => {
    const res = await request(app).get('/api/non-existent-route-path');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Route not found');
  });
});
