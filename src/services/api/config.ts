import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Environment configuration
const ENV = {
  development: {
    BASE_URL: 'https://support.deverp.net',
    TIMEOUT: 30000,
  },
  staging: {
    BASE_URL: 'https://support.deverp.net',
    TIMEOUT: 30000,
  },
  production: {
    BASE_URL: 'https://support.deverp.net',
    TIMEOUT: 30000,
  },
};

// Get current environment (you can modify this based on your build process)
const getCurrentEnv = () => {
  // You can set this based on your build configuration
  return __DEV__ ? 'development' : 'production';
};

const currentEnv = getCurrentEnv();
const config = ENV[currentEnv as keyof typeof ENV];

// API Response interface for DevERP API structure
export interface ApiResponse<T = any> {
  d: string; // DevERP API wraps response in "d" field
}

// Parsed API Response interface
export interface ParsedApiResponse<T = any> {
  success: number;
  data?: T;
  name?: string;
  link?: string;
  message?: string;
}

// API Error interface
export interface ApiError {
  message: string;
  statusCode: number;
  data?: any;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection');
    }

    // Add auth token if available
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    // Add device info headers
    if (config.headers) {
      config.headers['X-Device-Type'] = 'mobile';
      config.headers['X-App-Version'] = '1.0.0'; // You can get this from your app config
    }

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });

    // Parse the "d" field from DevERP API response
    if (response.data && response.data.d) {
      try {
        const parsedData = JSON.parse(response.data.d);
        console.log('Parsed API Response:', parsedData);
        
        // Check if the parsed response indicates success (accept both 1 and "1")
        if (String(parsedData.success) === '1') {
          return {
            ...response,
            data: parsedData,
          };
        } else {
          // Handle API-level errors
          const error: ApiError = {
            message: parsedData.message || 'API request failed',
            statusCode: response.status,
            data: parsedData,
          };
          return Promise.reject(error);
        }
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError);
        const error: ApiError = {
          message: 'Invalid response format',
          statusCode: response.status,
          data: response.data,
        };
        return Promise.reject(error);
      }
    }

    // Handle successful response
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          await AsyncStorage.removeItem('auth_token');
          // You can dispatch a logout action here if needed
          break;
        case 403:
          // Forbidden
          break;
        case 404:
          // Not found
          break;
        case 500:
          // Server error
          break;
        default:
          break;
      }

      const apiError: ApiError = {
        message: data?.message || error.message || 'Network error',
        statusCode: status,
        data: data,
      };

      return Promise.reject(apiError);
    }

    // Network error or timeout
    const networkError: ApiError = {
      message: error.message || 'Network error',
      statusCode: 0,
    };

    return Promise.reject(networkError);
  }
);

export default apiClient;
export { config as apiConfig };
