import { defineStore } from 'pinia';
import type { Event } from '~~/shared/types/user';

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [] as Event[],
  }),
  actions: {
    async createEvent(event: Omit<Event, '_id' | 'userId'>) {
      return apiRequest('/event/create', {
        loader: true,
        errorMessage: 'error_create_availability_failed',
      }).post<Event>(event);
    },

    async deleteEvent(id: string) {
      return apiRequest('/event/delete', {
        loader: true,
        errorMessage: 'error_delete_availability_failed',
      }).delete({ id });
    },
  },
});
