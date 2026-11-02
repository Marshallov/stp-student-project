import axios, { AxiosError } from 'axios';
import type { AppError } from '../types';

const TOKEN_KEY = 'student_hub_session';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem(TOKEN_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw) as { token?: string; expiresAt?: number };
      if (session.token && (!session.expiresAt || session.expiresAt > Date.now())) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<AppError>) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('student-hub:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') return 'Сервер не ответил вовремя. Попробуйте ещё раз.';
    if (!error.response) return 'Не удалось подключиться к серверу.';
    const data = error.response.data;
    return data?.message || data?.error || `Ошибка сервера (${error.response.status}).`;
  }
  return 'Произошла непредвиденная ошибка.';
}

export { TOKEN_KEY };
