import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest.url || "";

    if (status === 401 && !url.includes("/auth/refresh-token")) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        } = refreshResponse.data as { accessToken: string; refreshToken: string };

        setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
