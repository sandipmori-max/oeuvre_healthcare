import React, { useState, useCallback, useRef } from 'react';
import { getErrorMessage, retryApiCall } from '../services/api/utils';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  initialData?: any;
}

export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const {
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    initialData = null,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      // Cancel previous request if it's still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const data = await retryApiCall(
          () => apiCall(),
          retryCount,
          retryDelay
        );

        setState({
          data,
          loading: false,
          error: null,
        });

        onSuccess?.(data);
        return data;
      } catch (error: any) {
        // Don't update state if request was cancelled
        if (error.name === 'AbortError') {
          return;
        }

        const errorMessage = getErrorMessage(error);
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        onError?.(error);
        throw error;
      }
    },
    [retryCount, retryDelay, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      loading: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      loading: false,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    clearError,
    cancel,
  };
};

// Specialized hooks for common API operations
export const useApiCall = <T = any>(apiCall: () => Promise<T>, options: UseApiOptions = {}) => {
  const api = useApi<T>(options);

  const call = useCallback(() => {
    return api.execute(apiCall);
  }, [api, apiCall]);

  return {
    ...api,
    call,
  };
};

// Hook for API calls with automatic execution
export const useApiWithAutoCall = <T = any>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
) => {
  const api = useApi<T>(options);

  const call = useCallback(() => {
    return api.execute(apiCall);
  }, [api, apiCall]);

  // Auto-execute when dependencies change
  React.useEffect(() => {
    call();
  }, dependencies);

  return {
    ...api,
    call,
  };
};
