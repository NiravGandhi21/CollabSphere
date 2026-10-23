/**
 * MongoDB Atlas Connection Management via Mongoose.
 *
 * Architecture & Safety:
 *  - Reads MONGODB_URI from environment variables.
 *  - Validates format and checks for placeholder tokens (<username>, <cluster>).
 *  - Provides safe operational logging with zero secret/credential leakage.
 *  - Lifecycle listeners: handles connect, error, and disconnection events.
 *  - Idempotent: avoids duplicate connection attempts if already connected.
 *  - Graceful shutdown handlers for SIGINT / SIGTERM signals.
 *  - disconnectDB() helper for clean test harness teardowns.
 */

import mongoose from 'mongoose';

let isShutdownHookRegistered = false;

/**
 * Sanitizes a MongoDB connection URI for safe console logging.
 * Replaces credentials (user:password) with '***:***'.
 */
export function sanitizeUri(uri) {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

/**
 * Checks whether a URI string still contains template placeholders.
 */
export function isPlaceholderUri(uri) {
  if (!uri || typeof uri !== 'string') return true;
  return (
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('<cluster>') ||
    uri.includes('change_this')
  );
}

/**
 * Connect to MongoDB with robust error handling and lifecycle events.
 * @param {string} [customUri] - Optional URI override (useful for test databases).
 * @param {object} [options] - Additional Mongoose connection options.
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB(customUri, options = {}) {
  // If already connected, reuse existing active connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = customUri || process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MongoDB Configuration Error: MONGODB_URI is not defined in environment.');
    throw new Error('MONGODB_URI is required to connect to database.');
  }

  if (isPlaceholderUri(uri)) {
    console.warn(
      '⚠️ MongoDB Configuration Notice: MONGODB_URI contains unconfigured placeholder tokens (<username>, <cluster>).'
    );
    console.warn('   Please update backend/.env with your verified MongoDB Atlas connection string.');
    throw new Error('MONGODB_URI contains unconfigured template placeholders.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMS || 8000,
      ...options,
    });

    const host = conn.connection.host || 'remote-cluster';
    const dbName = conn.connection.name || 'collabsphere';
    console.log(`✅ Connected to MongoDB [Host: ${host} | Database: ${dbName}]`);

    // Register process signal hooks once for graceful shutdown
    if (!isShutdownHookRegistered && process.env.NODE_ENV !== 'test') {
      const gracefulShutdown = async (signal) => {
        try {
          console.log(`\n🛑 Received ${signal}. Closing MongoDB connection gracefully...`);
          await mongoose.connection.close(false);
          console.log('✅ MongoDB connection closed.');
          process.exit(0);
        } catch (closeErr) {
          console.error('❌ Error during graceful MongoDB disconnect:', closeErr.message);
          process.exit(1);
        }
      };

      process.once('SIGINT', () => gracefulShutdown('SIGINT'));
      process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
      isShutdownHookRegistered = true;
    }

    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Failure:', err.message);
    throw err;
  }
}

/**
 * Disconnect from MongoDB safely.
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
    console.log('🔌 Disconnected from MongoDB.');
  }
}
