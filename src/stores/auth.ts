import { defineStore } from 'pinia'
import type { User } from '@/types/user'
import { useApi } from '@/common/api'
import { getAccessToken, setAccessToken, clearAccessToken } from '@/common/api'
import { useAppStore } from './app'

let authInitialized = false;
let initPromise: Promise<void> | null = null;

export const useAuthStore = defineStore('auth', {
  state: (): {
    user: User | null;
    accessToken: string | null;
  } => ({
    user: null,
    accessToken: null,
  }),
  actions: {
    async login(email: string, password: string, rememberMe: boolean = false) {
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

        this.setUser(data.user as User);
        this.setToken(data.accessToken);

        return data;
      } catch (error) {
        if (error instanceof Error && !error.message.includes('Login failed')) {
          appStore.showMessage('Login failed. Please try again.', 'error');
        }
        throw error;
      }
    },

    async register(email: string, password: string, confirmPassword: string) {
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

        // Registration no longer returns accessToken — user must verify email first
        return data as { user: User; message: string };
      } catch (error) {
        if (error instanceof Error && !error.message.includes('Registration failed')) {
          appStore.showMessage('Registration failed. Please try again.', 'error');
        }
        throw error;
      }
    },

    async verifyEmail(token: string) {
      const { data, error } = await useApi('/auth/verify-email').post({ token });

      if (error) {
        throw new Error(error.message || 'Verification failed');
      }

      return data as { message: string };
    },

    async resendVerification(email: string) {
      const { data, error } = await useApi('/auth/resend-verification').post({ email });

      if (error) {
        throw new Error(error.message || 'Failed to resend verification');
      }

      return data as { message: string };
    },

    async requestPasswordReset(email: string) {
      const { data, error } = await useApi('/auth/request-password-reset').post({ email });

      if (error) {
        throw new Error(error.message || 'Failed to request password reset');
      }

      return data as { message: string };
    },

    async resetPassword(token: string, password: string, confirmPassword: string) {
      const { data, error } = await useApi('/auth/reset-password').post({
        token,
        password,
        confirmPassword,
      });

      if (error) {
        throw new Error(error.message || 'Password reset failed');
      }

      return data as { message: string };
    },

    async initAuth(): Promise<void> {
      if (authInitialized) return;

      if (initPromise) return initPromise;

      initPromise = this._doInitAuth();
      return initPromise;
    },

    async _doInitAuth(): Promise<void> {
      try {
        const token = getAccessToken();
        const savedUser = localStorage.getItem('user');

        if (!token || !savedUser) {
          this.clearAuth();
          authInitialized = true;
          return;
        }

        this.accessToken = token;
        this.user = JSON.parse(savedUser);

        const { data, error } = await useApi('/users/me').get();

        if (error) {
          const refreshResult = await useApi('/auth/refresh').post();

          if (refreshResult.error) {
            this.clearAuth();
            authInitialized = true;
            return;
          }

          setAccessToken(refreshResult.data.accessToken);
          this.accessToken = refreshResult.data.accessToken;

          const retryResult = await useApi('/users/me').get();

          if (retryResult.error) {
            this.clearAuth();
            authInitialized = true;
            return;
          }

          this.setUser(retryResult.data as User);
        } else {
          this.setUser(data as User);
        }
      } catch {
        this.clearAuth();
      } finally {
        authInitialized = true;
        initPromise = null;
      }
    },

    getUser(): User | null {
      return this.user;
    },

    setUser(user: User) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },

    setToken(token: string) {
      this.accessToken = token;
      setAccessToken(token);
    },

    clearAuth() {
      this.user = null;
      this.accessToken = null;
      clearAccessToken();
      localStorage.removeItem('user');
    },

    async logout() {
      try {
        await useApi('/auth/logout').post();
      } catch {
        // Even if the API call fails, clear local state
      }
      this.clearAuth();
    },

    resetInitState() {
      authInitialized = false;
      initPromise = null;
    },
  },
})
