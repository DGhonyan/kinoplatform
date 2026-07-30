// Announcement board: industry postings. The public list shows only `approved`
// posts; authed users create posts as `pending` for admin moderation.

export const ANNOUNCEMENT_CATEGORIES = [
  'casting',
  'crew_call',
  'funding',
  'workshop',
  'platform_update',
] as const;
export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

// Categories only admins may post (the platform's own voice). KEEP IN SYNC with
// the backend announcement.constants.ts.
export const ADMIN_ONLY_CATEGORIES: AnnouncementCategory[] = ['platform_update'];

// Which label the card's call-to-action button shows.
export const ANNOUNCEMENT_CTA_TYPES = ['apply', 'read_more', 'participate'] as const;
export type AnnouncementCtaType = (typeof ANNOUNCEMENT_CTA_TYPES)[number];

export const ANNOUNCEMENT_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export type Announcement = {
  _id: string;
  category: AnnouncementCategory;
  title: string;
  description: string;
  deadline: string; // 'YYYY-MM-DD' day, or '' when there's no deadline
  link: string; // external URL the CTA opens (empty = no CTA button)
  ctaType: AnnouncementCtaType;
  status: AnnouncementStatus;
  createdAt: string;
};

// Detail view (gated GET /announcements/:id) — the card fields plus the full body.
export type AnnouncementDetail = Announcement & {
  body: string;
};

// The create payload (what the form submits).
export type AnnouncementInput = {
  category: AnnouncementCategory;
  title: string;
  description?: string;
  body?: string;
  deadline?: string;
  link?: string;
  ctaType?: AnnouncementCtaType;
};
