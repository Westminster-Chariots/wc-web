"use client";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";


const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
const requestTimestamps: number[] = [];

// Request queue for rate limiting
let requestQueue: Array<() => void> = [];
let isProcessingQueue = false;

function checkRateLimit(): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Remove old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }
  
  return requestTimestamps.length < MAX_REQUESTS_PER_WINDOW;
}

function addToRateLimit() {
  requestTimestamps.push(Date.now());
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    if (checkRateLimit()) {
      const nextRequest = requestQueue.shift();
      nextRequest?.();
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay between requests
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s if rate limited
    }
  }
  
  isProcessingQueue = false;
}

export const api = axios.create({
  baseURL: `http://localhost:3001/api/v1`,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor for rate limiting and logging
api.interceptors.request.use(
  async (config) => {
    // Add auth token from localStorage
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Rate limiting check
    if (!checkRateLimit()) {
      return new Promise((resolve) => {
        requestQueue.push(() => resolve(config));
        processQueue();
      });
    }
    
    addToRateLimit();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic and error handling
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: number };
    const isRefreshEndpoint = original.url?.includes("/auth/refresh");
    
    // Handle 401 - Unauthorized (token refresh)
    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = 1;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");
        
        const { data } = await axios.post(`http://localhost:3001/api/v1/auth/refresh`, 
          { refreshToken },
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );
        
        if (data.accessToken) {
          localStorage.setItem("access_token", data.accessToken);
          if (original.headers) {
            original.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return api(original);
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        
        // Only redirect if not already on auth pages
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const isAuthPage = ["/auth", "/book/login", "/reset-password"].includes(currentPath);
          
          if (!isAuthPage) {
            toast.error("Session expired. Please login again.");
            window.location.href = "/auth";
          }
        }
        return Promise.reject(error);
      }
    }
    
    // Handle 429 - Rate Limited
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10);
      toast.warning(`Too many requests. Retrying in ${retryAfter} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(original);
    }
    
    // Handle timeout errors with user-friendly message
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      toast.error("Request timed out. The server may be starting up, please try again.");
      return Promise.reject(error);
    }
    
    // Retry logic for network errors and 5xx errors
    if (
      (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
      (original._retry ?? 0) < 3
    ) {
      original._retry = (original._retry ?? 0) + 1;
      const delay = Math.min(1000 * Math.pow(2, original._retry), 10000); // Exponential backoff
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(original);
    }
    
    // User-friendly error messages
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const message = (error.response?.data as any)?.message || error.message;
      
      if (status === 403) {
        toast.error("Access denied. You don't have permission.");
      } else if (status === 404) {
        toast.error("Resource not found.");
      } else if (status === 422) {
        toast.error(message || "Invalid data provided.");
      } else if (status && status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (!error.response) {
        toast.error("Network error. Please check your connection.");
      }
    }
    
    return Promise.reject(error);
  }
);
