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

    // Full, immediate account deletion. Step-up = current password. The backend
    // cascades across every collection + blobs and clears the auth cookies.
    // useApi so the danger-zone dialog can show a bad password inline.
    async deleteAccount(password: string) {
      return useApi('/account').delete<{ message: string }>({ password });
    },
  },
});
