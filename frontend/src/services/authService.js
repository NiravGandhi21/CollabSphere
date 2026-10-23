/**
 * Auth Service — Smart Fallback Mode & Session Resilience
 *
 * Tries real Express backend first.
 * Falls back to mock data if backend is offline.
 * Automatically purges expired/invalid tokens on 401.
 */

import { apiFetch, getStoredToken, setStoredToken, ApiError } from './api.js';
import { mockUsers } from '../data/mockUsers.js';

// In-memory mock session (used only when backend is offline)
let _mockCurrentUser = null;

async function tryApi(path, opts, fallbackFn) {
  try {
    return await apiFetch(path, opts);
  } catch (err) {
    if (err instanceof TypeError || err.status >= 500) {
      console.warn('[AuthService] Backend offline, using mock session');
      return fallbackFn();
    }
    throw err;
  }
}

export const authService = {
  async getCurrentUser() {
    const token = getStoredToken();
    if (!token) {
      return null;
    }
    // Handle offline mock token
    if (token.startsWith('mock_token_')) {
      const mockId = token.replace('mock_token_', '');
      return mockUsers.find((u) => u.id === mockId) || _mockCurrentUser;
    }
    return tryApi(
      '/auth/me',
      {},
      () => _mockCurrentUser
    )
      .then((data) => data?.user || data)
      .catch((err) => {
        if (err.status === 401) {
          console.warn('[AuthService] Stored token rejected (401). Purging session token.');
          setStoredToken(null);
          return null;
        }
        return _mockCurrentUser;
      });
  },

  async login(email, password) {
    if (!email || !password) throw new ApiError('Email and password are required', 400);

    return tryApi(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      () => {
        const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) throw new ApiError('Invalid email or password', 401);
        _mockCurrentUser = user;
        setStoredToken(`mock_token_${user.id}`);
        return { token: `mock_token_${user.id}`, user };
      }
    ).then((data) => {
      if (data.token) setStoredToken(data.token);
      return data;
    });
  },

  async register({ name, email, password, department, graduationYear, semester }) {
    if (!name || !email || !password || !department)
      throw new ApiError('All required fields must be completed', 400);

    return tryApi(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password, department, graduationYear, semester }) },
      () => {
        if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase()))
          throw new ApiError('Email already registered', 400);
        const newUser = {
          id: `usr_${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          department,
          graduationYear: Number(graduationYear) || 2026,
          semester: semester || '6th Semester',
          headline: 'Student Engineer',
          bio: '',
          skills: [],
          githubUrl: '',
          linkedinUrl: '',
          portfolioUrl: '',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          role: 'student',
          joinedDate: 'Just now',
        };
        mockUsers.push(newUser);
        _mockCurrentUser = newUser;
        setStoredToken(`mock_token_${newUser.id}`);
        return { token: `mock_token_${newUser.id}`, user: newUser };
      }
    ).then((data) => {
      if (data.token) setStoredToken(data.token);
      return data;
    });
  },

  async logout() {
    setStoredToken(null);
    _mockCurrentUser = null;
    return true;
  },

  async switchPersona(personaKey) {
    const { mockPersonas, DEMO_PASSWORD } = await import('../data/mockSession.js');
    const persona = mockPersonas.find((p) => p.key === personaKey);
    if (!persona || !persona.email) {
      await this.logout();
      return null;
    }
    try {
      // Connects live against real Express API with verified demo credentials
      const res = await this.login(persona.email, DEMO_PASSWORD || 'DemoStudent@2026!');
      return res.user;
    } catch (err) {
      console.warn('[AuthService] Live login failed or backend offline, falling back to mock persona:', err.message);
      _mockCurrentUser = mockUsers.find((u) => u.id === persona.userId) || null;
      if (_mockCurrentUser) {
        setStoredToken(`mock_token_${_mockCurrentUser.id}`);
      } else {
        setStoredToken(null);
      }
      return _mockCurrentUser;
    }
  },

  getCurrentPersonaKey() {
    return 'auto';
  },
};
