/**
 * Auth Controller
 *
 * POST /api/auth/register  — create account + return JWT
 * POST /api/auth/login     — verify credentials + return JWT
 * GET  /api/auth/me        — return authenticated user's profile (protected)
 */

import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

// ── Zod schemas ──────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(2, 'Department is required'),
  graduationYear: z.coerce.number().int().min(2020).max(2032).optional(),
  semester: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// ── Helper: build clean response (strips hash) ────────────────────────────────
function userResponse(user, token) {
  return {
    token,
    user: user.toJSON(), // toJSON strips passwordHash via schema transform
  };
}

// ── POST /api/auth/register ──────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await User.findOne({ email: data.email });
    if (exists) {
      return res.status(400).json({
        message: 'Email is already registered. Please sign in instead.',
      });
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: data.password, // pre-save hook hashes this
      department: data.department,
      graduationYear: data.graduationYear,
      semester: data.semester,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
    });

    const token = signToken({ id: user._id.toString(), role: user.role });
    return res.status(201).json(userResponse(user, token));
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Must explicitly select passwordHash since schema sets select: false
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ id: user._id.toString(), role: user.role });
    return res.json(userResponse(user, token));
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}
