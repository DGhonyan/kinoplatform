import { defineStore } from 'pinia';

export const useAccountStore = defineStore('account', {
  actions: {
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
