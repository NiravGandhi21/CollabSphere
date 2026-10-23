/**
 * AuthContext — works in both real-API mode and mock-fallback mode.
 *
 * In real mode: restores session via GET /auth/me on mount.
 * In mock/fallback mode: authService.getCurrentUser() returns mock user directly.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [personaKey, setPersonaKey] = useState('auto');
  const [loading, setLoading] = useState(true);

  // ── Initialize session on mount ────────────────────────────────────────────
  useEffect(() => {
    async function initAuth() {
      try {
        const result = await authService.getCurrentUser();
        // result can be { user } (real API) or a user object directly (mock)
        const currentUser = result?.user ?? result;
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setPersonaKey('guest');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── dev persona switcher (works in mock mode) ──────────────────────────────
  const switchPersona = useCallback(async (key) => {
    setLoading(true);
    try {
      const newUser = await authService.switchPersona(key);
      setUser(newUser);
      setPersonaKey(key);
      return newUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── local state update (e.g. after profile edit) ───────────────────────────
  const updateUserInState = useCallback((updatedUser) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    personaKey,
    loading,
    login,
    register,
    logout,
    switchPersona,
    updateUserInState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
