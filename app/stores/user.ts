import { defineStore } from 'pinia';
import type { User, Recommendation, TalentSearchFilters } from '~~/shared/types/user';

export type UserProfile = User & {
  recommendations: Recommendation[];
};

export const useUserStore = defineStore('user', {
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

    async attachAvatar(fileId: string) {
      const authStore = useAuthStore();

      if (!authStore.user) {
        throw new Error('Unauthorized');
      }

      const data = await apiRequest('/files/attach/avatar', {
        loader: true,
        errorMessage: 'error_update_profile_failed',
      }).patch<User>({ fileId });

      if (data) {
        authStore.setUser(data);
      }

      return data;
    },

    async attachPortfolioFile(fileId: string) {
      const authStore = useAuthStore();

      if (!authStore.user) {
        throw new Error('Unauthorized');
      }

      const data = await apiRequest('/files/attach/portfolio', {
        loader: true,
        errorMessage: 'error_update_profile_failed',
      }).patch<User>({ fileId });

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

    // Server-side talent search: appearance/age/gender are filtered on the server;
    // the response carries only public card fields (no appearance).
    async searchTalents(filters: TalentSearchFilters) {
      return apiRequest('/users/talents/search', {
        loader: true,
        errorMessage: 'error_load_talents_failed',
      }).post<User[]>(filters);
    },

    // Facet lists (distinct locations + educations among talents) for the filter
    // dropdowns — one "list meta" call until these get dedicated reference data.
    async getTalentListMeta() {
      return apiRequest('/users/talents/meta').get<{
        locations: string[];
        educations: string[];
      }>();
    },

    async getUserProfile(userId: string) {
      return apiRequest(`/users/profile/${userId}`, {
        loader: true,
        errorMessage: 'error_load_user_profile_failed',
      }).get<UserProfile>();
    },

    // Public endpoint — newest members for the home showcase. Quiet on failure
    // (showError: false) so the landing page never throws a snackbar at guests.
    async getRecentUsers() {
      return apiRequest('/users/recent', { showError: false }).get<User[]>();
    },
  },
});
