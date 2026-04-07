import type { User, Event } from '@/types/user'
import { defineStore } from 'pinia'
import { useApi, withLoader } from '@/common/api';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

export type UserProfile = User & {
  events: Event[];
};

export const useUserStore = defineStore('user', {
  actions: {
    async updateUser(user: Partial<User>) {
      const authStore = useAuthStore();
      const appStore = useAppStore();
      const authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      await withLoader(async () => {
        try {
          const { data, error } = await useApi('/users/update').patch(user);

          if (!data || error) {
            throw new Error('Failed to update user');
          }

          authStore.setUser(data as User);
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
          const { data, error } = await useApi('/users/all').get();

          if (!data || error) {
            appStore.showMessage('Failed to load users', 'error');
            throw new Error('Failed to get all users');
          }

          return data as User[];
        } catch (error) {
          appStore.showMessage('Failed to load users', 'error');
          throw error;
        }
      });
    },

    async getUserProfile(userId: string): Promise<UserProfile> {
      const appStore = useAppStore();

      return withLoader(async () => {
        try {
          const { data, error } = await useApi(`/users/profile/${userId}`).get();

          if (!data || error) {
            appStore.showMessage('Failed to load user profile', 'error');
            throw new Error('Failed to get user profile');
          }

          return data as UserProfile;
        } catch (error) {
          appStore.showMessage('Failed to load user profile', 'error');
          throw error;
        }
      });
    },
  },
});
