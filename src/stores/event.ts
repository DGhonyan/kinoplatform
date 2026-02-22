import { useApi, withLoader } from '@/common/api';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import type { Event } from '@/types/user';

export const useEventStore = defineStore('event', {
  actions: {
    async createEvent(event: Omit<Event, '_id' | 'user_id'>) {
      const authStore = useAuthStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      return await withLoader(async () => {
        const { data, error } = await useApi('/event/create').post({
          ...event,
          user_id: authUser._id,
        }).json();

        if (!data.value || error.value) {
          throw new Error('Failed to create event');
        }
        return data.value as Event;
      });
    },

    async getEvents() {
      const authStore = useAuthStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      return await withLoader(async () => {
        const { data, error } = await useApi(`/event/${authUser._id}`).get().json();

        if (!data.value || error.value) {
          throw new Error('Failed to get events');
        }

        return data.value as Event[];
      });
    },

    async getEventsByUserId(userId: string) {
      return await withLoader(async () => {
        const { data, error } = await useApi(`/event/list/${userId}`).get().json();

        if (!data.value || error.value) {
          throw new Error('Failed to get events');
        }

        return data.value as Event[];
      });
    },

    async deleteEvent(id: string) {
      const authStore = useAuthStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      return await withLoader(async () => {
        const { error } = await useApi(`/event/delete`).delete({
          id,
        }).json();

        if (error.value) {
          throw new Error('Failed to delete event');
        }
      });
    },
  },
});