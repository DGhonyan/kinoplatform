import { useApi, withLoader } from '@/common/api';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { useAppStore } from './app';
import type { Event } from '@/types/user';

export const useEventStore = defineStore('event', {
  actions: {
    async createEvent(event: Omit<Event, '_id' | 'user_id'>) {
      const authStore = useAuthStore();
      const appStore = useAppStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      return await withLoader(async () => {
        try {
          const { data, error } = await useApi('/event/create').post({
            ...event,
            user_id: authUser._id,
          }).json();

          if (!data.value || error.value) {
            appStore.showMessage('Failed to create availability', 'error');
            throw new Error('Failed to create event');
          }
          
          return data.value as Event;
        } catch (error) {
          appStore.showMessage('Failed to create availability', 'error');
          throw error;
        }
      });
    },

    async getEvents() {
      const authStore = useAuthStore();
      const appStore = useAppStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      return await withLoader(async () => {
        try {
          const { data, error } = await useApi(`/event/${authUser._id}`).get().json();

          if (!data.value || error.value) {
            appStore.showMessage('Failed to load availability', 'error');
            throw new Error('Failed to get events');
          }

          return data.value as Event[];
        } catch (error) {
          appStore.showMessage('Failed to load availability', 'error');
          throw error;
        }
      });
    },

    async getEventsByUserId(userId: string) {
      const appStore = useAppStore();
      
      return await withLoader(async () => {
        try {
          const { data, error } = await useApi(`/event/list/${userId}`).get().json();

          if (!data.value || error.value) {
            appStore.showMessage('Failed to load availability', 'error');
            throw new Error('Failed to get events');
          }

          return data.value as Event[];
        } catch (error) {
          appStore.showMessage('Failed to load availability', 'error');
          throw error;
        }
      });
    },

    async deleteEvent(id: string) {
      const authStore = useAuthStore();
      const appStore = useAppStore();
      let authUser = authStore.getUser();

      if (!authUser) {
        throw new Error('Unauthorized');
      }

      return await withLoader(async () => {
        try {
          const { error } = await useApi(`/event/delete`).delete({
            id,
          }).json();

          if (error.value) {
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