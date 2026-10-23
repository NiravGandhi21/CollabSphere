/**
 * Collaboration Service — Smart Fallback Mode
 */

import { apiFetch, ApiError } from './api.js';
import { mockCollaborations } from '../data/mockCollaborations.js';
import { mockProjects } from '../data/mockProjects.js';
import { mockUsers } from '../data/mockUsers.js';

let _collabs = [...mockCollaborations];

async function tryApi(path, opts, fallbackFn) {
  try {
    return await apiFetch(path, opts);
  } catch (err) {
    if (err instanceof TypeError || (err.status >= 500)) {
      console.warn('[CollaborationService] Backend offline, using mock data');
      return fallbackFn();
    }
    throw err;
  }
}

function populateCollab(req) {
  const project = mockProjects.find((p) => p.id === req.projectId) || { title: 'Unknown Project' };
  const applicant = mockUsers.find((u) => u.id === req.applicantId) || { name: 'Unknown Student' };
  return { ...req, project, applicant };
}

export const collaborationService = {
  async getRequestsForCreator(creatorId) {
    return tryApi(
      '/collaborations/incoming',
      {},
      () => {
        const createdIds = mockProjects.filter((p) => p.creatorId === creatorId).map((p) => p.id);
        return _collabs
          .filter((c) => createdIds.includes(c.projectId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(populateCollab);
      }
    );
  },

  async getRequestsForApplicant(applicantId) {
    return tryApi(
      '/collaborations/outgoing',
      {},
      () =>
        _collabs
          .filter((c) => c.applicantId === applicantId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(populateCollab)
    );
  },

  async checkExistingRequest(projectId, applicantId) {
    return tryApi(
      `/collaborations/check/${projectId}`,
      {},
      () => _collabs.find((c) => c.projectId === projectId && c.applicantId === applicantId) || null
    );
  },

  async submitRequest(projectId, pitchMessage, applicantId) {
    if (!pitchMessage || pitchMessage.trim().length < 20 || pitchMessage.trim().length > 500) {
      throw new ApiError('Pitch message must be between 20 and 500 characters', 400);
    }

    return tryApi(
      '/collaborations',
      { method: 'POST', body: JSON.stringify({ projectId, pitchMessage }) },
      () => {
        const project = mockProjects.find((p) => p.id === projectId);
        if (!project) throw new ApiError('Target project not found', 404);
        if (project.creatorId === applicantId)
          throw new ApiError('Cannot submit a request to your own project', 400);
        if (!project.isAcceptingMembers)
          throw new ApiError('This project is not accepting members', 400);
        const existing = _collabs.find(
          (c) => c.projectId === projectId && c.applicantId === applicantId && c.status === 'Pending'
        );
        if (existing) throw new ApiError('You already have a pending request', 400);
        const newReq = {
          id: `collab_${Date.now()}`,
          projectId,
          applicantId,
          pitchMessage: pitchMessage.trim(),
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };
        _collabs.unshift(newReq);
        return populateCollab(newReq);
      }
    );
  },

  async updateRequestStatus(requestId, status, leadUserId) {
    return tryApi(
      `/collaborations/${requestId}/status`,
      { method: 'PUT', body: JSON.stringify({ status }) },
      () => {
        const req = _collabs.find((c) => c.id === requestId);
        if (!req) throw new ApiError('Request not found', 404);
        req.status = status;
        return populateCollab(req);
      }
    );
  },
};
