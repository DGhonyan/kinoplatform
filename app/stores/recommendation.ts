import { defineStore } from 'pinia';
import type { Recommendation } from '~~/shared/types/user';

export const useRecommendationStore = defineStore('recommendation', {
  actions: {
    /**
     * Create or update the current user's recommendation for `targetId`.
     * The backend upserts on (authorId, targetId), so this both adds and edits.
     */
    async save(targetId: string, text: string) {
      return apiRequest('/recommendations', {
        loader: true,
        errorMessage: 'error_recommendation_failed',
        successMessage: 'recommendation_saved',
      }).post<Recommendation>({ targetId, text });
    },

    async remove(id: string) {
      return apiRequest(`/recommendations/${id}`, {
        errorMessage: 'error_recommendation_delete_failed',
      }).delete<{ message: string }>();
    },
  },
});
