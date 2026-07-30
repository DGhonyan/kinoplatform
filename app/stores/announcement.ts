import { defineStore } from 'pinia';
import type {
  Announcement,
  AnnouncementDetail,
  AnnouncementInput,
} from '~~/shared/types/announcement';

export const useAnnouncementStore = defineStore('announcement', {
  actions: {
    // Public board — approved posts, optionally filtered by category.
    async listAnnouncements(category?: string) {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      return apiRequest(`/announcements${query}`, {
        errorMessage: 'error_load_announcements_failed',
      }).get<Announcement[]>();
    },

    // Stored as `pending` for admin review. No `errorMessage`: an override would
    // shadow ANNOUNCEMENT_FORBIDDEN / ANNOUNCEMENT_CREATE_FAILED.
    async createAnnouncement(payload: AnnouncementInput) {
      return apiRequest('/announcements', {
        loader: true,
        successMessage: 'announcement_submitted',
      }).post<Announcement>(payload);
    },

    // Authed only. No `errorMessage`: an override wins over apiErrorMessageKey
    // and would shadow the ANNOUNCEMENT_NOT_FOUND / FORBIDDEN mappings.
    async getAnnouncement(id: string) {
      return apiRequest(`/announcements/${id}`).get<AnnouncementDetail>();
    },

    // The caller's own posts (any status), for the "Mine" tab.
    async listMine() {
      return apiRequest('/announcements/mine', {
        errorMessage: 'error_load_announcements_failed',
      }).get<Announcement[]>();
    },

    // Admin — moderation queue.
    async listPending() {
      return apiRequest('/announcements/pending', {
        errorMessage: 'error_load_announcements_failed',
      }).get<Announcement[]>();
    },

    // Admin — approve/reject (the only statuses the backend accepts here).
    async setAnnouncementStatus(id: string, status: 'approved' | 'rejected') {
      return apiRequest(`/announcements/${id}/status`, {
        loader: true,
      }).patch<Announcement>({ status });
    },

    async deleteAnnouncement(id: string) {
      return apiRequest(`/announcements/${id}`, {
        loader: true,
      }).delete<{ message: string }>();
    },
  },
});
