// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update API calls to include trailing slashes
export const register = (data) => api.post('/auth/register/', data);
export const login = (data) => api.post('/auth/login/', data);
export const searchUsers = (query) => api.get('/users/search/', { params: { query } });
export const searchSessions = () => api.get('/sessions/');
export const createSession = (data) => api.post('/sessions/', data);
export const joinSession = (sessionId) => api.post('/sessions/join/', { session_id: sessionId });
export const leaveSession = (sessionId) => api.post('/sessions/leave/', { session_id: sessionId });
// ... other API calls
