import { defineStore } from 'pinia';
import type { Event } from '~~/shared/types/user';

export const useEventStore = defineStore('event', () => {
  async function createEvent(event: Omit<Event, '_id' | 'userId'>) {
    const appStore = useAppStore();

    return await withLoader(async () => {
      try {
        const { data, error } = await useApi('/event/create').post(event);

        if (!data || error) {
          appStore.showMessage('Failed to create availability', 'error');
          throw new Error('Failed to create event');
        }

        return data as Event;
      }
      catch (err) {
        appStore.showMessage('Failed to create availability', 'error');
        throw err;
      }
    });
  }

  async function deleteEvent(id: string) {
    const appStore = useAppStore();

    return await withLoader(async () => {
      try {
        const { error } = await useApi('/event/delete').delete({ id });

        if (error) {
          appStore.showMessage('Failed to delete availability', 'error');
          throw new Error('Failed to delete event');
        }
      }
      catch (err) {
        appStore.showMessage('Failed to delete availability', 'error');
        throw err;
      }
    });
  }

  return { createEvent, deleteEvent };
});
