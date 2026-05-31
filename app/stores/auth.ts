import { defineStore } from 'pinia';
import type { User } from '~~/shared/types/user';

let authInitialized = false;
let initPromise: Promise<void> | null = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),

  actions: {
    setUser(newUser: User) {
      this.user = newUser;
      localStorage.setItem('user', JSON.stringify(newUser));
    },

    clearAuth() {
      this.user = null;
      localStorage.removeItem('user');
    },

    async login(email: string, password: string, rememberMe: boolean = false) {
      const res = await useApi('/auth/login').post<{ user: User }>({
        email,
        password,
        rememberMe,
      });

      if (res.data) {
        this.setUser(res.data.user);
      }

      return res;
    },

    async register(email: string, password: string) {
      return apiRequest('/auth/register').post<{ user: User; message: string }>({
        email,
        password,
      });
    },

    async verifyEmail(email: string, code: string) {
      return useApi('/auth/verify-email').post<{ message: string }>({ email, code });
    },

    async resendVerification(email: string) {
      return apiRequest('/auth/resend-verification', { showError: false }).post<{ message: string }>({ email });
    },

    async requestPasswordReset(email: string) {
      return apiRequest('/auth/request-password-reset', { showError: false }).post<{ message: string }>({ email });
    },

    async resetPassword(email: string, code: string, password: string) {
      return apiRequest('/auth/reset-password').post<{ message: string }>({
        email,
        code,
        password,
      });
    },

    async _doInitAuth(): Promise<void> {
      try {
        // Optimistic UX: hydrate from cached profile while we revalidate.
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          this.user = JSON.parse(savedUser);
        }

        // Cookie rides along automatically. apiFetch handles refresh-on-401.
        // showError: false — a logged-out cold start gets a quiet null, not a
        // "Session expired" snackbar on every load.
        const data = await apiRequest('/users/me', { showError: false }).get<User>();

        if (!data) {
          this.clearAuth();
          return;
        }

        this.setUser(data);
      }
      catch {
        this.clearAuth();
      }
      finally {
        authInitialized = true;
        initPromise = null;
      }
    },

    async initAuth(): Promise<void> {
      if (authInitialized) return;
      if (initPromise) return initPromise;

      initPromise = this._doInitAuth();
      return initPromise;
    },

    async logout() {
      // showError: false — logging out shouldn't nag if the server call fails;
      // we clear local auth regardless.
      await apiRequest('/auth/logout', { showError: false }).post();
      this.clearAuth();
    },

    resetInitState() {
      authInitialized = false;
      initPromise = null;
    },
  },
});
