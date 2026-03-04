import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { useApi, withLoader } from '@/common/api';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

export const useUserStore = defineStore('user', {
  actions: {
    async updateUser(user: Partial<User>) {
      const authStore = useAuthStore();
      const appStore = useAppStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      await withLoader(async () => {
        try {
          const { data, error } = await useApi('/users/update').patch({
            ...user,
            email: authUser?.email,
          }).json();

          if (!data.value || error.value) {
            // appStore.showMessage(error.message);
            throw new Error('Failed to update user');
          }

          authStore.setUser(data.value as User);
        } catch (error) {
          appStore.showMessage('Failed to update profile', 'error');
          throw error;
        }
      });
    },

    async getAllUsers() {
      const appStore = useAppStore();
      
      return withLoader(async () => {
        try {
          const { data, error } = await useApi('/users/all').get().json();

          if (!data.value || error.value) {
            appStore.showMessage('Failed to load users', 'error');
            throw new Error('Failed to get all users');
          }

          return data.value as User[];
        } catch (error) {
          appStore.showMessage('Failed to load users', 'error');
          throw error;
        }
      });
    },

    async getUserById(userId: string) {
      const appStore = useAppStore();
      
      return withLoader(async () => {
        try {
          const { data, error } = await useApi(`/users/user/${userId}`).get().json();

          if (!data.value || error.value) {
            appStore.showMessage('Failed to load user profile', 'error');
            throw new Error('Failed to get user by id');
          }

          return data.value as User;
        } catch (error) {
          appStore.showMessage('Failed to load user profile', 'error');
          throw error;
        }
      });
    },
  },
});
