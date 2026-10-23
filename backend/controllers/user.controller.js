/**
 * User Controller
 *
 * GET  /api/users           — list students (search, skill, department filters)
 * GET  /api/users/:id       — get student profile + authored & member projects
 * PUT  /api/users/:id       — update own profile (protected, owner-only)
 * PUT  /api/users/profile/me— convenience alias for authenticated user
 */

import { z } from 'zod';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  headline: z.string().trim().max(160).optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  githubUrl: z.string().trim().url().or(z.literal('')).optional(),
  linkedinUrl: z.string().trim().url().or(z.literal('')).optional(),
  portfolioUrl: z.string().trim().url().or(z.literal('')).optional(),
  semester: z.string().optional(),
  graduationYear: z.coerce.number().int().min(2020).max(2032).optional(),
  avatar: z.string().optional(),
});

// ── GET /api/users ───────────────────────────────────────────────────────────
export async function getUsers(req, res, next) {
  try {
    const { search = '', skill = '', department = '' } = req.query;

    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (skill) {
      filter.skills = { $elemMatch: { $regex: new RegExp(`^${skill}$`, 'i') } };
    }

    let users = await User.find(filter).sort({ createdAt: -1 });

    // Text search across name, headline, department, skills (done in JS for flexibility)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.headline || '').toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q) ||
          u.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return res.json(users.map((u) => u.toJSON()));
  } catch (err) {
    next(err);
  }
}

// ── GET /api/users/:id ───────────────────────────────────────────────────────
export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const authoredProjects = await Project.find({ creatorId: user._id }).sort({ createdAt: -1 });
    const memberProjects = await Project.find({ memberIds: user._id }).sort({ createdAt: -1 });

    return res.json({
      ...user.toJSON(),
      authoredProjects: authoredProjects.map((p) => p.toJSON()),
      memberProjects: memberProjects.map((p) => p.toJSON()),
    });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/users/:id ───────────────────────────────────────────────────────
export async function updateProfile(req, res, next) {
  try {
    // Users can only update their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own profile' });
    }

    const updates = updateSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const serialized = user.toJSON();

    // Canonical response envelope with backward-compatible top-level keys
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: serialized,
      user: serialized,
      ...serialized,
    });
  } catch (err) {
    next(err);
  }
}
