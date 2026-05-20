import type { FetchError } from 'ofetch';
import type { NitroFetchOptions } from 'nitropack';

type ApiOptions = NitroFetchOptions<string>;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const config = useRuntimeConfig();

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      await $fetch('/auth/refresh', {
        baseURL: config.public.apiUrl,
        method: 'POST',
        credentials: 'include',
      });
      return true;
    }
    catch {
      return false;
    }
    finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiError {
  message: string;
  [key: string]: unknown;
}

export type ApiResult<T> = { data: T | null; error: ApiError | null; status: number };

function toApiError(fetchErr: FetchError): ApiError {
  const data = fetchErr.data as Record<string, unknown> | undefined;
  if (data && typeof data.message === 'string') {
    return data as ApiError;
  }
  return { message: fetchErr.message };
}

async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<ApiResult<T>> {
  const config = useRuntimeConfig();

  const requestOptions: ApiOptions = {
    baseURL: config.public.apiUrl,
    credentials: 'include',
    ...options,
  };

  try {
    const data = await $fetch<T>(path, requestOptions);
    return { data, error: null, status: 200 };
  }
  catch (err) {
    const fetchErr = err as FetchError;
    const status = fetchErr.response?.status ?? 500;

    if (status === 401) {
      const refreshed = await tryRefreshToken();

      if (refreshed) {
        try {
          const data = await $fetch<T>(path, requestOptions);
          return { data, error: null, status: 200 };
        }
        catch (retryErr) {
          const retryFetchErr = retryErr as FetchError;
          return {
            data: null,
            error: toApiError(retryFetchErr),
            status: retryFetchErr.response?.status ?? 500,
          };
        }
      }

      const authStore = useAuthStore();
      authStore.clearAuth();
      navigateTo('/login');
      return { data: null, error: { message: 'Session expired' }, status: 401 };
    }

    return {
      data: null,
      error: toApiError(fetchErr),
      status,
    };
  }
}

export function useApi(path: string) {
  return {
    get<T = unknown>() {
      return apiFetch<T>(path, { method: 'GET' });
    },
    post<T = unknown>(body?: Record<string, unknown>) {
      return apiFetch<T>(path, { method: 'POST', body });
    },
    patch<T = unknown>(body?: Record<string, unknown>) {
      return apiFetch<T>(path, { method: 'PATCH', body });
    },
    delete<T = unknown>(body?: Record<string, unknown>) {
      return apiFetch<T>(path, { method: 'DELETE', body });
    },
  };
}

export const withLoader = async <T>(fn: () => Promise<T>): Promise<T> => {
  const appStore = useAppStore();

  appStore.showLoader();

  return fn().finally(() => {
    appStore.hideLoader();
  });
};
