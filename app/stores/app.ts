import { defineStore } from 'pinia';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export type AppMessage = {
  text: string;
  type: MessageType;
  duration?: number;
  variables?: Record<string, string | number>;
};

export const useAppStore = defineStore('app', () => {
  const loading = ref(false);
  const message = ref<AppMessage | null>(null);

  function showLoader() {
    loading.value = true;
  }

  function hideLoader() {
    loading.value = false;
  }

  function showMessage(
    text: string,
    type: MessageType = 'info',
    options?: {
      duration?: number;
      variables?: Record<string, string | number>;
    },
  ) {
    message.value = {
      text,
      type,
      duration: options?.duration ?? 5000,
      variables: options?.variables,
    };
  }

  function hideMessage() {
    message.value = null;
  }

  return { loading, message, showLoader, hideLoader, showMessage, hideMessage };
});
