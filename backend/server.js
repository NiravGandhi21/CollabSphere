/**
 * CollabSphere Backend - Express Server Entry Point
 *
 * Architecture:
 *  - Express.js REST API
 *  - MongoDB via Mongoose
 *  - JWT Authentication (bcryptjs + jsonwebtoken)
 *  - Zod input validation
 *  - Morgan request logging
 *  - CORS configured for React frontend (port 5173)
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

// Route modules
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';

// Error handler
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
// ── Environment validation ────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'test') {
  process.env.PORT = process.env.PORT || '5001';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_collabsphere_12345';
  process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
}

const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length && process.env.NODE_ENV !== 'test') {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}
const PORT = process.env.PORT || 5000;

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
  })
);
app.use(mongoSanitize({
  replaceWith: '_',
}));

// Adjust CORS to use CLIENT_URL env (allow dev fallback)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    service: 'CollabSphere API',
    database: dbState,
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe – returns 200 only if DB is connected
app.get('/api/healthz', (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const ok = dbState === 'connected';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'unavailable',
    database: dbState,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/collaborations', collaborationRoutes);

// ── Static Assets (Docker / Unified Deployment) ─────────────────────────────
if (process.env.SERVE_STATIC === 'true') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.warn(
      '⚠️ Notice: Server started in disconnected database mode. Set MONGODB_URI in backend/.env to connect to Atlas.'
    );
  }
  app.listen(PORT, () => {
    console.log(`✅ CollabSphere API running on http://localhost:${PORT}`);
  });
}

// Only auto-start when executed directly (not when imported in test runner)
if (process.env.NODE_ENV !== 'test') {
  start();
}

export { app };
export default app;
