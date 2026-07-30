import { defineStore } from 'pinia';
import type { User, Session } from '~~/shared/types/user';

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
      // showError: false — local auth is cleared regardless of the server call.
      await apiRequest('/auth/logout', { showError: false }).post();
      this.clearAuth();
    },

    // The backend keeps THIS session alive and revokes the others, so no
    // re-login. useApi: the popup shows INVALID_CURRENT_PASSWORD inline.
    async changePassword(currentPassword: string, newPassword: string) {
      return useApi('/auth/password').patch<{ message: string }>({
        currentPassword,
        newPassword,
      });
    },

    // Step 1 of email change: verify current password, send a code to the new
    // address. useApi so the popup can branch on EMAIL_IN_USE / bad password.
    async requestEmailChange(email: string, currentPassword: string) {
      return useApi('/auth/email/change').post<{ message: string }>({
        email,
        currentPassword,
      });
    },

    // Step 2: confirm with the code. On success patch the one field locally,
    // mirroring the backend's lowercase normalization.
    async confirmEmailChange(code: string, newEmail: string) {
      const res = await useApi('/auth/email/verify-change').post<{ message: string }>({ code });

      if (!res.error && this.user) {
        this.setUser({ ...this.user, email: newEmail.trim().toLowerCase() });
      }

      return res;
    },

    async listSessions() {
      return apiRequest('/auth/sessions', {
        errorMessage: 'error_load_sessions_failed',
      }).get<Session[]>();
    },

    async revokeSession(id: string) {
      return apiRequest(`/auth/sessions/${id}`, {
        errorMessage: 'error_revoke_session_failed',
      }).delete<{ message: string }>();
    },

    async revokeOtherSessions() {
      return apiRequest('/auth/sessions', {
        errorMessage: 'error_revoke_session_failed',
      }).delete<{ message: string }>();
    },

    resetInitState() {
      authInitialized = false;
      initPromise = null;
    },
  },
});
