import { useApi, withLoader } from '@/common/api';
import { defineStore } from 'pinia';
import { useAppStore } from './app';
import type { Event } from '@/types/user';

export const useEventStore = defineStore('event', {
  actions: {
    async createEvent(event: Omit<Event, '_id' | 'userId'>) {
      const appStore = useAppStore();

      return await withLoader(async () => {
        try {
          const { data, error } = await useApi('/event/create').post(event);

          if (!data || error) {
            appStore.showMessage('Failed to create availability', 'error');
            throw new Error('Failed to create event');
          }

          return data as Event;
        } catch (error) {
          appStore.showMessage('Failed to create availability', 'error');
          throw error;
        }
      });
    },

    async deleteEvent(id: string) {
      const appStore = useAppStore();

      return await withLoader(async () => {
        try {
          const { error } = await useApi('/event/delete').delete({ id });

          if (error) {
            appStore.showMessage('Failed to delete availability', 'error');
            throw new Error('Failed to delete event');
          }
        } catch (error) {
          appStore.showMessage('Failed to delete availability', 'error');
          throw error;
        }
      });
    },
  },
});
