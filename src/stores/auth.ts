import { defineStore } from 'pinia'
import type { User } from '@/types/user'
import { useApi } from '@/common/api'
import { useAppStore } from './app'

export const useAuthStore = defineStore('auth', {
  state: (): {
    user: User | null;
  } => ({
    user: null,
  }),
  actions: {
    async login(email: string, password: string) {
      const appStore = useAppStore();
      
      try {
        const { data, error } = await useApi('/users/login').post({
          email,
          password,
        }).json();

        if (error.value) {
          appStore.showMessage(error.value.message || 'Login failed', 'error');
          throw new Error(error.value.message);
        }

        this.setUser(data.value as User);

        return data.value;
      } catch (error) {
        appStore.showMessage('Login failed. Please try again.', 'error');
        throw error;
      }
    },

    getUser() {
      this.user = JSON.parse(localStorage.getItem('user') || 'null');

      return this.user;
    },

    setUser(user: User) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },

    async logout() {
      this.user = null;
      localStorage.removeItem('user');
    },

    async register(email: string, password: string, confirmPassword: string) {
      const appStore = useAppStore();
      
      try {
        const { data, error } = await useApi('/users/create').post({
          email,
          password,
          confirmPassword,
        }).json();

        if (error.value) {
          appStore.showMessage(error.value.message || 'Registration failed', 'error');
          throw new Error(error.value.message);
        }

        this.setUser(data.value as User);

        return data.value;
      } catch (error) {
        appStore.showMessage('Registration failed. Please try again.', 'error');
        throw error;
      }
    },
  },
}) 