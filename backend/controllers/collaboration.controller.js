/**
 * Collaboration Controller
 *
 * GET  /api/collaborations/incoming      — requests for creator's projects (protected)
 * GET  /api/collaborations/outgoing      — requests submitted by current user (protected)
 * GET  /api/collaborations/check/:pid   — check for existing request on a project (protected)
 * POST /api/collaborations              — submit a join request (protected)
 * PUT  /api/collaborations/:id/status   — accept/decline a request (protected, lead only)
 */

import mongoose from 'mongoose';
import { z } from 'zod';
import { Collaboration } from '../models/Collaboration.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

// ── Zod Schemas ──────────────────────────────────────────────────────────────
const submitSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  pitchMessage: z
    .string()
    .trim()
    .min(20, 'Pitch message must be at least 20 characters')
    .max(500, 'Pitch message cannot exceed 500 characters'),
});

const statusSchema = z.object({
  status: z.enum(['Accepted', 'Declined'], {
    errorMap: () => ({ message: 'Status must be "Accepted" or "Declined"' }),
  }),
});

// ── Populate Helper ───────────────────────────────────────────────────────────
async function populateRequest(req) {
  const project = await Project.findById(req.projectId).select('title creatorId');
  const applicant = await User.findById(req.applicantId).select('name email department avatar semester skills');
  return {
    ...req.toJSON(),
    project: project ? project.toJSON() : { title: 'Unknown Project' },
    applicant: applicant ? applicant.toJSON() : { name: 'Unknown Student' },
  };
}

// ── GET /api/collaborations/incoming ─────────────────────────────────────────
export async function getIncoming(req, res, next) {
  try {
    // Find all projects created by the authenticated user
    const createdProjects = await Project.find({ creatorId: req.user.id }).select('_id');
    const projectIds = createdProjects.map((p) => p._id);

    const requests = await Collaboration.find({ projectId: { $in: projectIds } }).sort({
      createdAt: -1,
    });

    const populated = await Promise.all(requests.map(populateRequest));
    return res.json(populated);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/collaborations/outgoing ─────────────────────────────────────────
export async function getOutgoing(req, res, next) {
  try {
    const requests = await Collaboration.find({ applicantId: req.user.id }).sort({ createdAt: -1 });
    const populated = await Promise.all(requests.map(populateRequest));
    return res.json(populated);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/collaborations/check/:projectId ──────────────────────────────────
export async function checkExisting(req, res, next) {
  try {
    const existing = await Collaboration.findOne({
      projectId: req.params.projectId,
      applicantId: req.user.id,
    });
    return res.json(existing ? existing.toJSON() : null);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/collaborations ──────────────────────────────────────────────────
export async function submitRequest(req, res, next) {
  try {
    const { projectId, pitchMessage } = submitSchema.parse(req.body);

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Target project not found' });
    }

    if (project.creatorId.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: 'Cannot submit a collaboration request to your own project' });
    }

    if (!project.isAcceptingMembers) {
      return res
        .status(400)
        .json({ message: 'This project is not currently accepting new members' });
    }

    // Check if applicant is already a confirmed roster member
    const isAlreadyMember = (project.memberIds || []).some(
      (m) => m.toString() === req.user.id
    );
    if (isAlreadyMember) {
      return res
        .status(400)
        .json({ message: 'You are already a confirmed member of this project team' });
    }

    // Prevent duplicate active pending requests
    const existingPending = await Collaboration.findOne({
      projectId,
      applicantId: req.user.id,
      status: 'Pending',
    });
    if (existingPending) {
      return res
        .status(400)
        .json({ message: 'You already have a pending request for this project' });
    }

    const request = await Collaboration.create({
      projectId,
      applicantId: req.user.id,
      pitchMessage,
    });

    const populated = await populateRequest(request);
    return res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/collaborations/:id/status ───────────────────────────────────────
// Requirements: Roster consistency, race condition prevention, and authorization
export async function updateStatus(req, res, next) {
  try {
    const { status } = statusSchema.parse(req.body);

    const request = await Collaboration.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    // Verify target project exists
    const project = await Project.findById(request.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    // Verify authenticated user is the lead of the target project
    if (project.creatorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Unauthorized: Only the project lead can accept or decline requests' });
    }

    // Race condition prevention: Confirm request is still Pending
    if (request.status !== 'Pending') {
      return res.status(400).json({
        message: `This collaboration request has already been ${request.status.toLowerCase()}.`,
      });
    }

    // Atomic conditional status update to prevent race conditions
    const updatedRequest = await Collaboration.findOneAndUpdate(
      { _id: request._id, status: 'Pending' },
      { $set: { status } },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(409).json({
        message: 'Conflict: This request was modified by another operation.',
      });
    }

    // If accepted: atomically add applicant to project's roster using $addToSet (prevents duplicates)
    if (status === 'Accepted') {
      await Project.findByIdAndUpdate(request.projectId, {
        $addToSet: { memberIds: request.applicantId },
      });
    }

    const populated = await populateRequest(updatedRequest);
    return res.json(populated);
  } catch (err) {
    next(err);
  }
}
