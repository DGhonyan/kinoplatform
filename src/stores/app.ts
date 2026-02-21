// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: (): {
    loading: boolean;
  } => ({
    loading: false,
  }),
  actions: {
    showLoader() {
      this.loading = true;
    },
    hideLoader() {
      this.loading = false;
    },
  },
})
