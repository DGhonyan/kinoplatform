import { defineStore } from 'pinia';
import type { ConsentUpdate, User } from '~~/shared/types/user';

export const useAccountStore = defineStore('account', {
  actions: {
    // Privacy-policy acceptance and the marketing opt-in. The response is the
    // updated user, so the consent dialog and Settings switch react at once.
    async updateConsent(consent: ConsentUpdate) {
      const user = await apiRequest('/account/consent', {
        errorMessage: 'error_consent_update_failed',
      }).patch<User>(consent);
      if (user) useAuthStore().setUser(user);
      return user;
    },

    // GDPR data export — the full account dump, for a client-side JSON download.
    async exportData() {
      return apiRequest('/account/export', {
        loader: true,
        errorMessage: 'error_export_failed',
      }).get<Record<string, unknown>>();
    },

    // Immediate deletion; the backend cascades everything and clears the auth
    // cookies. useApi so the danger-zone dialog shows a bad password inline.
    async deleteAccount(password: string) {
      return useApi('/account').delete<{ message: string }>({ password });
    },
  },
});
