/**
 * AUTH CONTEXT
 * Global authentication state management using React Context.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      toast.success(res.message || 'Login successful!');
      return { success: true, role: res.user.role };
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin', isStudent: user?.role === 'student' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
