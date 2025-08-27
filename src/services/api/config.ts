import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const ENV = {
  development: {
    BASE_URL: "http://support.deverp.net",
    TIMEOUT: 30000,
  },
  staging: {
    BASE_URL: "http://support.deverp.net",
    TIMEOUT: 30000,
  },
  production: {
    BASE_URL: "http://support.deverp.net",
    TIMEOUT: 30000,
  },
};

const getEnvVars = () => {
  return ENV.development;  
};

const { BASE_URL, TIMEOUT } = getEnvVars();

export interface ApiResponse<T = any> {
  d?: string;
  success?: string | number;
  message?: string;
  data?: T;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  data?: any;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    console.log("🚀 ~ config:", config)
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return Promise.reject({
        message: "No internet connection",
        statusCode: 0,
      });
    }

    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (response.data && response.data.d) {
      try {
        let raw = response.data.d;

        let clean = raw
          .replace(/,,/g, ",")  
          .replace(/,(\s*[}\]])/g, "$1");  

        const parsedData = JSON.parse(clean);

        if (String(parsedData.success) === "1") {
          return {
            ...response,
            data: parsedData,
          };
        } else {
          const error: ApiError = {
            message: parsedData.message || "API request failed",
            statusCode: response.status,
            data: parsedData,
          };
          return Promise.reject(error);
        }
      } catch (parseError) {
        console.error("❌ Failed to parse API response:", parseError);
        const error: ApiError = {
          message: "Invalid response format",
          statusCode: response.status,
          data: response.data,
        };
        return Promise.reject(error);
      }
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const err: ApiError = {
        message: error.response.data?.message || "API error occurred",
        statusCode: error.response.status,
        data: error.response.data,
      };
      return Promise.reject(err);
    } else if (error.request) {
      return Promise.reject({
        message: "No response from server",
        statusCode: 0,
      });
    } else {
      return Promise.reject({
        message: error.message || "Unknown error occurred",
        statusCode: 0,
      });
    }
  }
);

export default apiClient;
