import { API_URL } from "./constants";
import { useAppStore } from "@/stores/app";
import router from "@/router";

const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) return false;

      const data = await res.json();
      setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<{ data: any; error: any; status: number }> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // On 401, attempt silent token refresh and retry once
  if (res.status === 401 && token) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      // Refresh failed — clear auth and redirect to login
      clearAccessToken();
      localStorage.removeItem('user');
      router.push({ name: 'Login' });
      return { data: null, error: { message: 'Session expired' }, status: 401 };
    }
  }

  if (!res.ok) {
    let error: any;
    try {
      error = await res.json();
    } catch {
      error = { message: res.statusText };
    }
    return { data: null, error, status: res.status };
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { data, error: null, status: res.status };
}

function createApiMethod(path: string) {
  return {
    async get() {
      return apiFetch(path, { method: 'GET' });
    },
    async post(body?: any) {
      return apiFetch(path, {
        method: 'POST',
        body: body != null ? JSON.stringify(body) : undefined,
      });
    },
    async patch(body?: any) {
      return apiFetch(path, {
        method: 'PATCH',
        body: body != null ? JSON.stringify(body) : undefined,
      });
    },
    async delete(body?: any) {
      return apiFetch(path, {
        method: 'DELETE',
        body: body != null ? JSON.stringify(body) : undefined,
      });
    },
  };
}

export function useApi(path: string) {
  return createApiMethod(path);
}

export const withLoader = async <T>(fn: () => Promise<T>): Promise<T> => {
  const appStore = useAppStore();

  appStore.showLoader();

  return fn().finally(() => {
    appStore.hideLoader();
  });
}
