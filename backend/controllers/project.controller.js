/**
 * Project Controller
 *
 * GET    /api/projects          — list projects (search, tech, openOnly)
 * GET    /api/projects/:id      — get single project (populated)
 * POST   /api/projects          — create project (protected)
 * PUT    /api/projects/:id      — update project (protected, creator only)
 * DELETE /api/projects/:id      — delete project + cascade collaborations (protected, creator only)
 */

import mongoose from 'mongoose';
import { z } from 'zod';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Collaboration } from '../models/Collaboration.js';

// ── Zod Schemas ──────────────────────────────────────────────────────────────
const projectSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  tagline: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().min(10, 'Please add a description').max(3000),
  problemStatement: z.string().max(1000).optional().default(''),
  techStack: z.array(z.string()).optional().default([]),
  githubUrl: z.string().trim().url('A valid GitHub URL is required'),
  liveDemoUrl: z.string().trim().url().or(z.literal('')).optional().default(''),
  isAcceptingMembers: z.boolean().optional().default(false),
  requiredRoles: z.string().max(300).optional().default(''),
  category: z.string().optional().default('Engineering Prototype'),
});

// ── Utility: Populate a project with creator and member objects ───────────────
async function populateProject(project) {
  const creator = await User.findById(project.creatorId);
  const members = await User.find({ _id: { $in: project.memberIds } });

  return {
    ...project.toJSON(),
    creator: creator ? creator.toJSON() : { id: project.creatorId, name: 'Project Lead' },
    members: members.map((m) => m.toJSON()),
    memberCount: (project.memberIds ? project.memberIds.length : 0) + 1, // +1 for the lead
  };
}

// ── GET /api/projects ─────────────────────────────────────────────────────────
export async function getProjects(req, res, next) {
  try {
    const { search = '', tech = '', openOnly = '' } = req.query;

    const filter = {};

    if (openOnly === 'true') {
      filter.isAcceptingMembers = true;
    }

    if (tech && tech.trim()) {
      filter.techStack = { $elemMatch: { $regex: new RegExp(`^${tech.trim()}$`, 'i') } };
    }

    let projects = await Project.find(filter).sort({ createdAt: -1 });

    // Text search (in-process, covers title/tagline/description/techStack)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.tagline || '').toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.techStack || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Populate creator for showcase cards
    const populated = await Promise.all(
      projects.map(async (p) => {
        const creator = await User.findById(p.creatorId).select('name department avatar');
        return {
          ...p.toJSON(),
          creator: creator ? creator.toJSON() : { name: 'Unknown Student' },
          memberCount: (p.memberIds ? p.memberIds.length : 0) + 1,
        };
      })
    );

    return res.json(populated);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
export async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project showcase not found' });
    }

    const result = await populateProject(project);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/projects ────────────────────────────────────────────────────────
export async function createProject(req, res, next) {
  try {
    const data = projectSchema.parse(req.body);

    const project = await Project.create({
      ...data,
      creatorId: req.user.id,
      memberIds: [],
    });

    const result = await populateProject(project);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/projects/:id ─────────────────────────────────────────────────────
export async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.creatorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only the project creator can edit this showcase' });
    }

    const updates = projectSchema.partial().parse(req.body);

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const result = await populateProject(updated);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/projects/:id ──────────────────────────────────────────────────
// Requirement FR-PROJ-05: Cascade deletion of associated collaboration requests
export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.creatorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only the project creator can delete this showcase' });
    }

    // Attempt multi-document transaction if the MongoDB deployment is a replica set (e.g. Atlas)
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      await Collaboration.deleteMany({ projectId: project._id }, { session });
      await project.deleteOne({ session });
      await session.commitTransaction();
    } catch (txErr) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch {
          // ignore abort failure
        }
      }
      // If transactions are not supported on this deployment (e.g. standalone MongoMemoryServer),
      // execute defensive sequential cascade deletion
      if (
        txErr.message?.includes('replica set') ||
        txErr.message?.includes('Transaction numbers are only allowed') ||
        txErr.message?.includes('transactions are not supported')
      ) {
        await Collaboration.deleteMany({ projectId: project._id });
        await project.deleteOne();
      } else {
        throw txErr;
      }
    } finally {
      if (session) {
        await session.endSession();
      }
    }

    return res.json({ message: 'Project showcase and associated requests deleted successfully' });
  } catch (err) {
    next(err);
  }
}
