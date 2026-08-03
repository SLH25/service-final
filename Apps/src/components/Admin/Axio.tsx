import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokenManager";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:8000/api/accounts/";

const Api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// ── Request interceptor: attach access token from memory ──
Api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ──
Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and if we haven't already retried
    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return Api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}refresh/`,
        { refresh: refreshToken }
      );

      const newAccess = response.data.access;
      setTokens(newAccess, refreshToken); // keep same refresh token

      processQueue(null, newAccess);

      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return Api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      // Force a full page redirect to clear all state
      window.location.href = "/admin";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export async function logoutAdmin(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await Api.post("logout/", { refresh: refreshToken });
    } catch {
      // Ignorer les erreurs réseau: le refresh token est de toute façon supprimé côté client
    }
  }
  clearTokens();
}

export default Api;
