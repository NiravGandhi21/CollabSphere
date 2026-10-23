/**
 * User Service — Smart Fallback Mode with Response Normalization
 */

import { apiFetch } from './api.js';
import { mockUsers } from '../data/mockUsers.js';
import { mockProjects } from '../data/mockProjects.js';

let _mockUsers = [...mockUsers];

async function tryApi(path, opts, fallbackFn) {
  try {
    return await apiFetch(path, opts);
  } catch (err) {
    if (err instanceof TypeError || err.status >= 500) {
      console.warn('[UserService] Backend offline, using mock data');
      return fallbackFn();
    }
    throw err;
  }
}

export const userService = {
  async getUsers({ search = '', skill = '', department = '' } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (skill.trim()) params.set('skill', skill.trim());
    if (department.trim()) params.set('department', department.trim());
    const query = params.toString();

    return tryApi(
      `/users${query ? `?${query}` : ''}`,
      {},
      () => {
        let filtered = [..._mockUsers];
        if (department.trim()) filtered = filtered.filter((u) => u.department === department.trim());
        if (skill.trim()) {
          const sl = skill.toLowerCase().trim();
          filtered = filtered.filter((u) => u.skills.some((s) => s.toLowerCase() === sl));
        }
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          filtered = filtered.filter(
            (u) =>
              u.name.toLowerCase().includes(q) ||
              (u.headline || '').toLowerCase().includes(q) ||
              u.department.toLowerCase().includes(q) ||
              u.skills.some((s) => s.toLowerCase().includes(q))
          );
        }
        return filtered;
      }
    );
  },

  async getUserById(id) {
    return tryApi(
      `/users/${id}`,
      {},
      () => {
        const user = _mockUsers.find((u) => u.id === id);
        if (!user) throw new Error('Student profile not found');
        return {
          ...user,
          authoredProjects: mockProjects.filter((p) => p.creatorId === id),
          memberProjects: mockProjects.filter((p) => p.memberIds.includes(id)),
        };
      }
    );
  },

  async updateProfile(id, updates) {
    return tryApi(
      `/users/${id}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      () => {
        const idx = _mockUsers.findIndex((u) => u.id === id);
        if (idx === -1) throw new Error('User not found');
        _mockUsers[idx] = { ..._mockUsers[idx], ...updates };
        return _mockUsers[idx];
      }
    ).then((res) => {
      // Normalize response so callers always receive the unwrapped student object
      if (res && typeof res === 'object') {
        if (res.data && typeof res.data === 'object' && (res.data.id || res.data.name)) {
          return res.data;
        }
        if (res.user && typeof res.user === 'object' && (res.user.id || res.user.name)) {
          return res.user;
        }
      }
      return res;
    });
  },
};
