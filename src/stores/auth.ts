import { defineStore } from 'pinia'
import type { User } from '@/types/user'
import { useApi } from '@/common/api'

export const useAuthStore = defineStore('auth', {
  state: (): {
    user: User | null;
  } => ({
    user: null,
  }),
  actions: {
    async login(email: string, password: string) {
      const { data, error } = await useApi('/user/login').post({
        email,
        password,
      }).json();

      if (error.value) {
        throw new Error(error.value.message);
      }

      this.setUser(data.value as User);

      return data.value;
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
      const { data, error } = await useApi('/user/register').post({
        email,
        password,
        confirmPassword,
      }).json();

      if (error.value) {
        throw new Error(error.value.message);
      }

      this.setUser(data.value as User);

      return data.value;
    },
  },
}) 