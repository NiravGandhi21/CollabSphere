/**
 * Project Service — Smart Fallback Mode
 *
 * Tries the real Express backend first.
 * If the API is unreachable (backend not started / no MongoDB), falls back
 * to in-memory mock data so the UI is always demonstrable.
 */

import { apiFetch, ApiError } from './api.js';
import { mockProjects } from '../data/mockProjects.js';
import { mockUsers } from '../data/mockUsers.js';

// Runtime in-memory store (used when backend is offline)
let _mockProjects = [...mockProjects];

// ── Populate helper for mock mode ─────────────────────────────────────────────
function populateMock(p) {
  const creator = mockUsers.find((u) => u.id === p.creatorId) || { name: 'Unknown Student' };
  const members = (p.memberIds || [])
    .map((mId) => mockUsers.find((u) => u.id === mId))
    .filter(Boolean);
  return {
    ...p,
    creator,
    members,
    memberCount: (p.memberIds ? p.memberIds.length : 0) + 1,
  };
}

// ── API call with automatic fallback ─────────────────────────────────────────
async function tryApi(path, opts, fallbackFn) {
  try {
    return await apiFetch(path, opts);
  } catch (err) {
    // Network error (backend offline) → use mock
    if (err instanceof TypeError || (err.status >= 500)) {
      console.warn('[ProjectService] Backend offline, using mock data');
      return fallbackFn();
    }
    throw err; // Re-throw 4xx auth/validation errors
  }
}

export const projectService = {
  async getProjects({ search = '', tech = '', openOnly = false } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (tech.trim()) params.set('tech', tech.trim());
    if (openOnly) params.set('openOnly', 'true');
    const query = params.toString();

    return tryApi(
      `/projects${query ? `?${query}` : ''}`,
      {},
      () => {
        let filtered = [..._mockProjects];
        if (openOnly) filtered = filtered.filter((p) => p.isAcceptingMembers);
        if (tech.trim()) {
          const tl = tech.toLowerCase().trim();
          filtered = filtered.filter((p) => p.techStack.some((t) => t.toLowerCase() === tl));
        }
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              (p.tagline || '').toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.techStack.some((t) => t.toLowerCase().includes(q))
          );
        }
        return filtered.map(populateMock);
      }
    );
  },

  async getProjectById(id) {
    return tryApi(
      `/projects/${id}`,
      {},
      () => {
        const p = _mockProjects.find((p) => p.id === id);
        if (!p) throw new ApiError('Project not found', 404);
        return populateMock(p);
      }
    );
  },

  async createProject(projectData) {
    if (!projectData.title || projectData.title.trim().length < 3) {
      throw new ApiError('Project title must be at least 3 characters', 400);
    }
    if (!projectData.githubUrl) {
      throw new ApiError('A valid GitHub repository URL is required', 400);
    }

    return tryApi(
      '/projects',
      { method: 'POST', body: JSON.stringify(projectData) },
      () => {
        const newProject = {
          id: `proj_${Date.now()}`,
          ...projectData,
          creatorId: 'usr_01',
          memberIds: [],
          createdAt: new Date().toISOString(),
        };
        _mockProjects.unshift(newProject);
        return populateMock(newProject);
      }
    );
  },

  async updateProject(id, updates) {
    return tryApi(
      `/projects/${id}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      () => {
        const idx = _mockProjects.findIndex((p) => p.id === id);
        if (idx === -1) throw new ApiError('Project not found', 404);
        _mockProjects[idx] = { ..._mockProjects[idx], ...updates };
        return populateMock(_mockProjects[idx]);
      }
    );
  },

  async deleteProject(id) {
    return tryApi(
      `/projects/${id}`,
      { method: 'DELETE' },
      () => {
        const idx = _mockProjects.findIndex((p) => p.id === id);
        if (idx === -1) throw new ApiError('Project not found', 404);
        _mockProjects.splice(idx, 1);
        return { message: 'Deleted' };
      }
    );
  },

  async addMember() {
    // Handled server-side on collaboration accept
  },
};
