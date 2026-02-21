import { API_URL } from "./constants";
import { createFetch } from "@vueuse/core";
import { useAppStore } from "@/stores/app";

export const useApi = createFetch({
  baseUrl: API_URL,
  fetchOptions: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
}); 

export const withLoader = async <T>(fn: () => Promise<T>): Promise<T> => {
  const appStore = useAppStore();

  appStore.showLoader();

  return fn().finally(() => {
    appStore.hideLoader();
  });
}