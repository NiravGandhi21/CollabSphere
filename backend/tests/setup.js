/**
 * Vitest Global Setup for MongoDB Persistence Tests.
 *
 * Uses MongoMemoryServer to run an isolated, real MongoDB engine in-memory.
 * Ensures zero mutations against any remote or shared database.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export async function setupTestDB() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_super_secret_jwt_key_collabsphere_12345';
  process.env.JWT_EXPIRES_IN = '1d';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

export async function clearTestDB() {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

export async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}
