// --- api.js ---
// API service configuration for HTTP requests to the backend server.
// Provides centralized axios instance with consistent base URL and credentials.
// Used by components to communicate with the Express.js backend API.

import axios from 'axios';

/**
 * API Service Configuration
 * 
 * This file creates and exports a configured axios instance for making HTTP requests
 * to the backend server. It sets up the base URL, credentials handling, and other
 * default configurations that are used across the application.
 * 
 * Configuration:
 * - baseURL: Points to the Express.js backend server
 * - withCredentials: Enables sending cookies and authentication headers
 * - Default timeout and headers are handled by axios
 * 
 * Usage:
 * - Import this service in components that need to make API calls
 * - Use standard HTTP methods (GET, POST, PUT, DELETE)
 * - Automatic error handling and request/response interceptors
 */
const api = axios.create({ 
  baseURL: 'http://localhost:3001/api/submissions', // Backend API endpoint
  withCredentials: true // Enable sending cookies and auth headers
});

export default api;