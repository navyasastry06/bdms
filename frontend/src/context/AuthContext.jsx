import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState(() => {
    return localStorage.getItem('activeRole') || null;
  });

  const setActiveRole = (role) => {
    if (role) {
      localStorage.setItem('activeRole', role);
    } else {
      localStorage.removeItem('activeRole');
    }
    setActiveRoleState(role);
  };


  /* Silent authentication on mount (check if session is valid) */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

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
    /* Clear existing session before login */
    localStorage.removeItem('accessToken');
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);

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
    /* Clear existing session before register to prevent token leak or session contamination */
    localStorage.removeItem('accessToken');
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);

    const data = await authService.register(userData);
    if (data.isVerified === false) {
      return data;
    }
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

  const verifyOtp = async (email, otpCode) => {
    const data = await authService.verifyOtp(email, otpCode);
    setUser(data.user);
    setIsAuthenticated(true);
    try {
      const meData = await authService.getMe();
      if (meData.user) {
        setUser(meData.user);
      }
      setProfile(meData.profile);
    } catch (e) {
      console.error("Failed to load profile after OTP verification", e);
    }
    return data;
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setIsAuthenticated(true);
      return data.user;
    } catch (error) {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      throw error;
    }
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
      setActiveRole(null);
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
    logout,
    verifyOtp,
    refreshUser,
    activeRole,
    setActiveRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
