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

type ApiResult<T> = { data: T | null; error: any; status: number };

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
            error: retryFetchErr.data ?? { message: retryFetchErr.message },
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
      error: fetchErr.data ?? { message: fetchErr.message },
      status,
    };
  }
}

export function useApi(path: string) {
  return {
    get<T = any>() {
      return apiFetch<T>(path, { method: 'GET' });
    },
    post<T = any>(body?: any) {
      return apiFetch<T>(path, { method: 'POST', body });
    },
    patch<T = any>(body?: any) {
      return apiFetch<T>(path, { method: 'PATCH', body });
    },
    delete<T = any>(body?: any) {
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
