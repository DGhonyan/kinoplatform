import { defineStore } from 'pinia';
import type { User, Event } from '~~/shared/types/user';

export type UserProfile = User & {
  events: Event[];
};

export const useUserStore = defineStore('user', () => {
  async function updateUser(payload: Partial<User>) {
    const authStore = useAuthStore();
    const appStore = useAppStore();

    if (!authStore.user) {
      throw new Error('Unauthorized');
    }

    await withLoader(async () => {
      try {
        const { data, error } = await useApi('/users/update').patch(payload);

        if (!data || error) {
          throw new Error('Failed to update user');
        }

        authStore.setUser(data as User);
      }
      catch (err) {
        appStore.showMessage('Failed to update profile', 'error');
        throw err;
      }
    });
  }

  async function getAllUsers() {
    const appStore = useAppStore();

    return withLoader(async () => {
      try {
        const { data, error } = await useApi('/users/search').get();

        if (!data || error) {
          appStore.showMessage('Failed to load users', 'error');
          throw new Error('Failed to get all users');
        }

        return data as User[];
      }
      catch (err) {
        appStore.showMessage('Failed to load users', 'error');
        throw err;
      }
    });
  }

  async function getUserProfile(userId: string): Promise<UserProfile> {
    const appStore = useAppStore();

    return withLoader(async () => {
      try {
        const { data, error } = await useApi(`/users/profile/${userId}`).get();

        if (!data || error) {
          appStore.showMessage('Failed to load user profile', 'error');
          throw new Error('Failed to get user profile');
        }

        return data as UserProfile;
      }
      catch (err) {
        appStore.showMessage('Failed to load user profile', 'error');
        throw err;
      }
    });
  }

  return { updateUser, getAllUsers, getUserProfile };
});
