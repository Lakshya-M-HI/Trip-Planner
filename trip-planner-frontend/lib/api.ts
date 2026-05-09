import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send cookies (refresh token)
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ── Request interceptor: attach access token ──
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = (window as Record<string, unknown>).__accessToken as string | undefined;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ──
let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(undefined)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        if (typeof window !== "undefined") {
          (window as Record<string, unknown>).__accessToken = newToken;
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== "undefined") {
          (window as Record<string, unknown>).__accessToken = null;
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/** Set the access token for all subsequent requests */
export function setAccessToken(token: string | null) {
  if (typeof window !== "undefined") {
    (window as Record<string, unknown>).__accessToken = token;
  }
}

/** Get current access token */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return ((window as Record<string, unknown>).__accessToken as string) || null;
  }
  return null;
}

export default api;
