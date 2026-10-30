import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('devflow_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('devflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('devflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('devflow_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        localStorage.removeItem('devflow_token');
        localStorage.removeItem('devflow_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.token && data.user) {
      localStorage.setItem('devflow_token', data.token);
      localStorage.setItem('devflow_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    if (data.token && data.user) {
      localStorage.setItem('devflow_token', data.token);
      localStorage.setItem('devflow_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('devflow_token');
    localStorage.removeItem('devflow_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('devflow_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
