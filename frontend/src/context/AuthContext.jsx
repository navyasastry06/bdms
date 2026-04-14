import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Silent authentication on mount (check if session is valid) */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user);
        setProfile(data.profile);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        /* If getMe fails, the interceptor will try to refresh. If refresh fails, it cleans up */
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    /* Load profile right after login */
    try {
      const meData = await authService.getMe();
      setProfile(meData.profile);
    } catch (e) {
       console.error("Failed to load profile after login");
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setIsAuthenticated(true);
    /* Load profile right after registration */
    try {
      const meData = await authService.getMe();
      setProfile(meData.profile);
    } catch (e) {
      console.error("Failed to load profile after register");
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  };

  /* Add an inactivity timeout (10 minutes) */
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
        alert('You have been logged out due to inactivity.');
        window.location.href = '/login';
      }, 10 * 60 * 1000); /* 10 minutes */
    };

    /* Events that reset the timer */
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isAuthenticated]);

  const value = {
    user,
    profile,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
