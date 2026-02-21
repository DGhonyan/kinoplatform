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
        const { data, error } = await useApi('/user/update').patch({
          ...user,
          email: authUser?.email,
        }).json();

        if (!data.value || error.value) {
          throw new Error('Failed to update user');
        }

        authStore.setUser(data.value as User);
      });
    }
  },
});
