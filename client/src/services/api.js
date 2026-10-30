/**
 * Axios API Client Instance
 *
 * Configures base URL, authentication token injection,
 * and automatic 401 session expiry handling.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 unauthorized & expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Clear expired credentials
      localStorage.removeItem('devflow_token');
      localStorage.removeItem('devflow_user');

      // Only redirect if not already on login or register pages
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
