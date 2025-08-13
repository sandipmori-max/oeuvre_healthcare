import { ApiError } from './config';

/**
 * Check if the error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.message && (
    error.message.includes('Network Error') ||
    error.message.includes('No internet connection') ||
    error.message.includes('timeout')
  );
};

/**
 * Check if the error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if the error is a server error
 */
export const isServerError = (error: any): boolean => {
  return error.response?.status >= 500;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'No internet connection. Please check your network and try again.';
  }

  if (isAuthError(error)) {
    return 'Your session has expired. Please login again.';
  }

  if (isServerError(error)) {
    return 'Server error. Please try again later.';
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

/**
 * Retry function for API calls
 */
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors or client errors (4xx)
      if (isAuthError(error) || (error.response?.status >= 400 && error.response?.status < 500)) {
        throw error;
      }

      if (attempt < maxRetries) {
        console.log(`API call failed, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
};

/**
 * Debounce function for API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for API calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Cache API responses
 */
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const apiCache = new ApiCache();

/**
 * Generate cache key for API requests
 */
export const generateCacheKey = (url: string, params?: any): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${url}${paramString}`;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expiresAt: string): boolean => {
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  return currentTime >= expirationTime;
};

/**
 * Check if token will expire soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (expiresAt: string, minutes: number = 5): boolean => {
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const warningTime = minutes * 60 * 1000; // Convert minutes to milliseconds
  return (expirationTime - currentTime) <= warningTime;
};
