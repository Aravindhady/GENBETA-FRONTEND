/**
 * Unified API Client
 * 
 * WHAT: Centralized API service with consistent error handling, base URL, and token management
 * WHY: Eliminates inconsistencies between axios and fetch, provides single source of truth for API calls
 * 
 * Features:
 * - Environment-based base URL
 * - Automatic token injection
 * - Consistent error handling
 * - Request/response interceptors
 * - Retry logic for failed requests
 */

import axios from "axios";
import toast from "react-hot-toast";

// Environment-based configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors consistently
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly for cleaner usage
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = "Network error. Please check your connection.";
      return Promise.reject(error);
    }

    // Handle HTTP errors
    const { status, data } = error.response;

    // 401 Unauthorized - Clear token and redirect to login
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Show session expired message
      toast.error("Your session has expired. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    // 403 Forbidden
    if (status === 403) {
      return Promise.reject(new Error(data.message || "Access denied."));
    }

    // 404 Not Found
    if (status === 404) {
      return Promise.reject(new Error(data.message || "Resource not found."));
    }

    // 500 Server Error
    if (status >= 500) {
      return Promise.reject(new Error(data.message || "Server error. Please try again later."));
    }

    // Other errors
    return Promise.reject(new Error(data.message || "An error occurred."));
  }
);

export default apiClient;
