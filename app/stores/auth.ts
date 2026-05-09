import { defineStore } from 'pinia';
import type { User } from '~~/shared/types/user';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);

  let authInitialized = false;
  let initPromise: Promise<void> | null = null;

  function setUser(newUser: User) {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function setToken(token: string) {
    accessToken.value = token;
    setAccessToken(token);
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    clearAccessToken();
    localStorage.removeItem('user');
  }

  async function login(email: string, password: string, rememberMe: boolean = false) {
    const appStore = useAppStore();

    try {
      const { data, error } = await useApi('/auth/login').post({
        email,
        password,
        rememberMe,
      });

      if (error) {
        appStore.showMessage(error.message || 'Login failed', 'error');
        throw new Error(error.message);
      }

      setUser(data.user as User);
      setToken(data.accessToken);

      return data;
    }
    catch (err) {
      if (err instanceof Error && !err.message.includes('Login failed')) {
        appStore.showMessage('Login failed. Please try again.', 'error');
      }
      throw err;
    }
  }

  async function register(email: string, password: string, confirmPassword: string) {
    const appStore = useAppStore();

    try {
      const { data, error } = await useApi('/auth/register').post({
        email,
        password,
        confirmPassword,
      });

      if (error) {
        appStore.showMessage(error.message || 'Registration failed', 'error');
        throw new Error(error.message);
      }

      return data as { user: User; message: string };
    }
    catch (err) {
      if (err instanceof Error && !err.message.includes('Registration failed')) {
        appStore.showMessage('Registration failed. Please try again.', 'error');
      }
      throw err;
    }
  }

  async function verifyEmail(token: string) {
    const { data, error } = await useApi('/auth/verify-email').post({ token });

    if (error) {
      throw new Error(error.message || 'Verification failed');
    }

    return data as { message: string };
  }

  async function resendVerification(email: string) {
    const { data, error } = await useApi('/auth/resend-verification').post({ email });

    if (error) {
      throw new Error(error.message || 'Failed to resend verification');
    }

    return data as { message: string };
  }

  async function requestPasswordReset(email: string) {
    const { data, error } = await useApi('/auth/request-password-reset').post({ email });

    if (error) {
      throw new Error(error.message || 'Failed to request password reset');
    }

    return data as { message: string };
  }

  async function resetPassword(token: string, password: string, confirmPassword: string) {
    const { data, error } = await useApi('/auth/reset-password').post({
      token,
      password,
      confirmPassword,
    });

    if (error) {
      throw new Error(error.message || 'Password reset failed');
    }

    return data as { message: string };
  }

  async function _doInitAuth(): Promise<void> {
    try {
      const token = getAccessToken();
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        clearAuth();
        authInitialized = true;
        return;
      }

      accessToken.value = token;
      user.value = JSON.parse(savedUser);

      const { data, error } = await useApi('/users/me').get();

      if (error) {
        const refreshResult = await useApi('/auth/refresh').post<{ accessToken: string }>();

        if (refreshResult.error) {
          clearAuth();
          authInitialized = true;
          return;
        }

        setAccessToken(refreshResult.data!.accessToken);
        accessToken.value = refreshResult.data!.accessToken;

        const retryResult = await useApi('/users/me').get();

        if (retryResult.error) {
          clearAuth();
          authInitialized = true;
          return;
        }

        setUser(retryResult.data as User);
      }
      else {
        setUser(data as User);
      }
    }
    catch {
      clearAuth();
    }
    finally {
      authInitialized = true;
      initPromise = null;
    }
  }

  async function initAuth(): Promise<void> {
    if (authInitialized) return;
    if (initPromise) return initPromise;

    initPromise = _doInitAuth();
    return initPromise;
  }

  async function logout() {
    try {
      await useApi('/auth/logout').post();
    }
    catch {
      // even if the API call fails, clear local state
    }
    clearAuth();
  }

  function resetInitState() {
    authInitialized = false;
    initPromise = null;
  }

  return {
    user,
    accessToken,
    login,
    register,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
    initAuth,
    setUser,
    setToken,
    clearAuth,
    logout,
    resetInitState,
  };
});
