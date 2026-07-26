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

    // Create — the backend stores it as `pending` for admin review. No
    // `errorMessage`: POST returns ANNOUNCEMENT_FORBIDDEN (the server, not the
    // client-side category filter, is what actually enforces admin-only
    // categories) and ANNOUNCEMENT_CREATE_FAILED, both of which an override
    // would shadow.
    async createAnnouncement(payload: AnnouncementInput) {
      return apiRequest('/announcements', {
        loader: true,
        successMessage: 'announcement_submitted',
      }).post<Announcement>(payload);
    },

    /*
     * Full detail (with body) — authed only; drives the login funnel.
     *
     * Like the other id-addressed actions it passes NO `errorMessage`: api.ts
     * resolves `opts.errorMessage ?? apiErrorMessageKey(error)`, so an override
     * always wins and would shadow the ANNOUNCEMENT_NOT_FOUND /
     * ANNOUNCEMENT_FORBIDDEN codes these endpoints return, leaving those
     * mappings dead. Only the plain list actions keep an override — they
     * surface no announcement-specific codes to lose.
     */
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
