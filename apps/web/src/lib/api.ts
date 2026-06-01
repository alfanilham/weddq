import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "/api";

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("weddq_token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

export type ApiError = { error: string; details?: unknown };

export function extractError(err: unknown): string {
  const e = err as { response?: { data?: ApiError } };
  return e?.response?.data?.error ?? "Terjadi kesalahan. Silakan coba lagi.";
}
