import { defineStore } from 'pinia';
import type { Availability } from '~~/shared/types/user';

export const useAvailabilityStore = defineStore('availability', {
  actions: {
    // A user's availability windows (public read — bookers see it too).
    async listAvailability(userId: string) {
      return apiRequest(`/availability/user/${userId}`, {
        errorMessage: 'error_load_availability_failed',
      }).get<Availability[]>();
    },

    async createAvailability(window: Omit<Availability, '_id'>) {
      return apiRequest('/availability', {
        loader: true,
        errorMessage: 'error_create_availability_failed',
      }).post<Availability>(window);
    },

    async deleteAvailability(id: string) {
      return apiRequest(`/availability/${id}`, {
        loader: true,
        errorMessage: 'error_delete_availability_failed',
      }).delete<{ message: string }>();
    },

    // "Clear all" — wipe the caller's whole calendar.
    async clearAvailability() {
      return apiRequest('/availability', {
        loader: true,
        errorMessage: 'error_clear_availability_failed',
      }).delete<{ message: string }>();
    },
  },
});
