// Utilities
import { defineStore } from 'pinia'

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export type AppMessage = {
  text: string;
  type: MessageType;
  duration?: number;
  variables?: Record<string, string | number>;
}

export const useAppStore = defineStore('app', {
  state: (): {
    loading: boolean;
    message: AppMessage | null;
  } => ({
    loading: false,
    message: null,
  }),
  actions: {
    showLoader() {
      this.loading = true;
    },
    hideLoader() {
      this.loading = false;
    },
    showMessage(
      text: string, 
      type: MessageType = 'info', 
      options?: { 
        duration?: number;
        variables?: Record<string, string | number>;
      }
    ) {
      this.message = { 
        text, 
        type, 
        duration: options?.duration ?? 5000,
        variables: options?.variables,
      };
    },
    hideMessage() {
      this.message = null;
    },
  },
})
