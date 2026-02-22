import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { useApi, withLoader } from '@/common/api';
import { useAuthStore } from '@/stores/auth';

export const useUserStore = defineStore('user', {
  actions: {
    async updateUser(user: Partial<User>) {
      const authStore = useAuthStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      await withLoader(async () => {
        const { data, error } = await useApi('/users/update').patch({
          ...user,
          email: authUser?.email,
        }).json();

        if (!data.value || error.value) {
          throw new Error('Failed to update user');
        }

        authStore.setUser(data.value as User);
      });
    },

    async getAllUsers() {
      return withLoader(async () => {
        const { data, error } = await useApi('/users/all').get().json();

        if (!data.value || error.value) {
          throw new Error('Failed to get all users');
        }

        return data.value as User[];
      });
    },

    async getUserById(userId: string) {
      return withLoader(async () => {
        const { data, error } = await useApi(`/users/user/${userId}`).get().json();

        if (!data.value || error.value) {
          throw new Error('Failed to get user by id');
        }

        return data.value as User;
      });
    },
  },
});
