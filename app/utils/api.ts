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
  /** Machine-readable discriminator from the backend (e.g. 'EMAIL_NOT_VERIFIED').
   *  Prefer branching on this over the human-readable `message`. */
  code?: string;
  /** Per-field validation messages, present when code === 'VALIDATION_ERROR'. */
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export type ApiResult<T> = { data: T | null; error: ApiError | null; status: number };

function toApiError(fetchErr: FetchError): ApiError {
  const data = fetchErr.data as Record<string, unknown> | undefined;
  if (data && typeof data.message === 'string') {
    return data as ApiError;
  }
  // Defensive: a raw class-validator response (message: string[]) that didn't go
  // through the backend's normalizing filter. Collapse to a single string.
  if (data && Array.isArray(data.message)) {
    return { ...data, message: String(data.message[0] ?? 'Request failed') } as ApiError;
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
      return { data: null, error: { message: 'common_session_expired', code: ERROR_CODE.SESSION_EXPIRED }, status: 401 };
    }

    return {
      data: null,
      error: toApiError(fetchErr),
      status,
    };
  }
}

export type ApiRequestOptions = {
  errorMessage?: string;
  showError?: boolean;
  successMessage?: string;
  loader?: boolean;
};

type ApiMode = 'raw' | 'data';
type Outcome<M extends ApiMode, T> = M extends 'raw' ? ApiResult<T> : T | null;

function createApiMethods<M extends ApiMode>(
  run: <T>(options: ApiOptions) => Promise<Outcome<M, T>>,
) {
  return {
    get: <T = unknown>() => run<T>({ method: 'GET' }),
    post: <T = unknown>(body?: Record<string, unknown>) => run<T>({ method: 'POST', body }),
    patch: <T = unknown>(body?: Record<string, unknown>) => run<T>({ method: 'PATCH', body }),
    delete: <T = unknown>(body?: Record<string, unknown>) => run<T>({ method: 'DELETE', body }),
  };
}

async function handleRequest<T>(
  fetcher: () => Promise<ApiResult<T>>,
  opts: ApiRequestOptions,
): Promise<T | null> {
  const exec = async (): Promise<T | null> => {
    const { data, error } = await fetcher();

    if (error) {
      if (opts.showError !== false) {
        useAppStore().showMessage(opts.errorMessage ?? apiErrorMessageKey(error), 'error');
      }
      return null;
    }

    if (opts.successMessage) {
      useAppStore().showMessage(opts.successMessage, 'success');
    }

    return data;
  };

  return opts.loader ? withLoader(exec) : exec();
}

export function useApi(path: string) {
  return createApiMethods<'raw'>(<T>(options: ApiOptions) => apiFetch<T>(path, options));
}

export function apiRequest(path: string, opts: ApiRequestOptions = {}) {
  return createApiMethods<'data'>(<T>(options: ApiOptions) =>
    handleRequest<T>(() => apiFetch<T>(path, options), opts));
}

export const withLoader = async <T>(fn: () => Promise<T>): Promise<T> => {
  const appStore = useAppStore();

  appStore.showLoader();

  return fn().finally(() => {
    appStore.hideLoader();
  });
};
