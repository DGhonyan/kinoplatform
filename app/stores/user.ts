import { defineStore } from 'pinia';
import type { User, Event } from '~~/shared/types/user';

export type UserProfile = User & {
  events: Event[];
};

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
  }),

  actions: {
    async updateUser(payload: Partial<User> & { completeStep?: string }) {
      const authStore = useAuthStore();

      if (!authStore.user) {
        throw new Error('Unauthorized');
      }

      const data = await apiRequest('/users/update', {
        loader: true,
        errorMessage: 'error_update_profile_failed',
      }).patch<User>(payload);

      if (data) {
        authStore.setUser(data);
      }

      return data;
    },

    async getAllUsers() {
      return apiRequest('/users/search', {
        loader: true,
        errorMessage: 'error_load_users_failed',
      }).get<User[]>();
    },

    async getUserProfile(userId: string) {
      return apiRequest(`/users/profile/${userId}`, {
        loader: true,
        errorMessage: 'error_load_user_profile_failed',
      }).get<UserProfile>();
    },
  },
});
