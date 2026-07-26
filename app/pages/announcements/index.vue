<template>
  <div class="announcements-page">
    <div class="page-head">
      <div class="head-text">
        <h1 class="page-title">
          {{ $t('announcements_title') }}
        </h1>
        <p class="page-subtitle">
          {{ $t('announcements_subtitle') }}
        </p>
      </div>
      <Button
        v-if="isAuthed"
        color="primary"
        prepend-icon="mdi-plus"
        @click="showForm = true"
      >
        {{ $t('announcement_post_cta') }}
      </Button>
    </div>

    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        class="chip"
        :class="{ active: activeFilter === f.key, pending: f.key === 'pending' }"
        @click="setFilter(f.key)"
      >
        {{ $t(f.label) }}
      </button>
    </div>

    <div
      v-if="loading"
      class="state"
    >
      <v-progress-circular
        indeterminate
        size="28"
        width="3"
        color="primary"
      />
    </div>

    <div
      v-else-if="announcements.length"
      class="grid"
    >
      <AnnouncementCard
        v-for="a in announcements"
        :key="a._id"
        :announcement="a"
        :mode="cardMode"
        @approve="moderate($event, 'approved')"
        @reject="moderate($event, 'rejected')"
        @delete="onDelete"
      />
    </div>

    <p
      v-else
      class="state empty"
    >
      {{ $t(emptyText) }}
    </p>

    <AnnouncementFormPopup
      v-model="showForm"
      @created="onCreated"
    />

    <ConfirmDialog
      v-model="showDeleteConfirm"
      :title="$t('announcement_delete_confirm_title')"
      :text="$t('announcement_delete_confirm_text')"
      :confirm-label="$t('common_delete')"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Announcement } from '~~/shared/types/announcement';
import { ANNOUNCEMENT_CATEGORIES } from '~~/shared/types/announcement';
import Button from '~/components/Button.vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';
import AnnouncementCard from '~/components/announcements/AnnouncementCard.vue';
import AnnouncementFormPopup from '~/components/announcements/AnnouncementFormPopup.vue';

// Public page (added to the auth allowlist) — logged-out visitors can browse.
const authStore = useAuthStore();
const announcementStore = useAnnouncementStore();

const isAuthed = computed(() => !!authStore.user);
const isAdmin = computed(() => authStore.user?.type === 'admin');

const announcements = ref<Announcement[]>([]);
const loading = ref(true);
const activeFilter = ref<string>('all');
const showForm = ref(false);

const filters = computed(() => {
  const list = [
    { key: 'all', label: 'announcement_filter_all' },
    ...ANNOUNCEMENT_CATEGORIES.map(c => ({ key: c, label: `announcement_category_${c}` })),
  ];
  // Authed users can see their own posts; admins also get a moderation queue.
  if (isAuthed.value) list.push({ key: 'mine', label: 'announcement_filter_mine' });
  if (isAdmin.value) list.push({ key: 'pending', label: 'announcement_filter_pending' });
  return list;
});

// Guard against out-of-order responses: a slow earlier fetch must not clobber a
// newer one when the user switches filters quickly.
let loadSeq = 0;
const load = async () => {
  const seq = ++loadSeq;
  loading.value = true;
  let data: Announcement[] | null;
  if (activeFilter.value === 'pending') data = await announcementStore.listPending();
  else if (activeFilter.value === 'mine') data = await announcementStore.listMine();
  else {
    data = await announcementStore.listAnnouncements(
      activeFilter.value === 'all' ? undefined : activeFilter.value,
    );
  }
  if (seq !== loadSeq) return; // superseded by a newer load
  announcements.value = data ?? [];
  loading.value = false;
};

const cardMode = computed<'public' | 'moderate' | 'mine'>(() => {
  if (activeFilter.value === 'pending') return 'moderate';
  if (activeFilter.value === 'mine') return 'mine';
  return 'public';
});

const emptyText = computed(() => {
  if (activeFilter.value === 'pending') return 'announcement_no_pending';
  if (activeFilter.value === 'mine') return 'announcement_no_mine';
  return 'announcement_none';
});

const setFilter = (key: string) => {
  if (activeFilter.value === key) return;
  activeFilter.value = key;
  load();
};

const moderate = async (id: string, status: 'approved' | 'rejected') => {
  const ok = await announcementStore.setAnnouncementStatus(id, status);
  // Moderated post leaves the pending queue — drop it locally, no refetch.
  if (ok) announcements.value = announcements.value.filter(a => a._id !== id);
};

// Delete (author's own or admin) — confirm first.
const showDeleteConfirm = ref(false);
const deleteTargetId = ref<string | null>(null);
const deleting = ref(false);

const onDelete = (id: string) => {
  deleteTargetId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  const id = deleteTargetId.value;
  if (!id) return;
  deleting.value = true;
  try {
    const ok = await announcementStore.deleteAnnouncement(id);
    if (ok) announcements.value = announcements.value.filter(a => a._id !== id);
  }
  finally {
    deleting.value = false;
    showDeleteConfirm.value = false;
    deleteTargetId.value = null;
  }
};

// New posts land as pending — refresh the current view so "Mine"/"Pending" update.
const onCreated = () => load();

onMounted(load);
</script>

<style scoped lang="scss">
.announcements-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 30px;
  font-weight: 600;
}

.page-subtitle {
  font-size: 15px;
  opacity: 0.7;
  margin: 4px 0 0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  font-size: 13px;
  font-weight: 500;
  padding: 7px 16px;
  border-radius: 999px;
  // Vuetify's reset doesn't zero a <button>'s background or border, so without
  // this the inactive chips render as UA `ButtonFace` grey with the dark
  // theme's near-white text — about 1.2:1 contrast.
  background: none;
  border: 1px solid color(--v-theme-on-surface, 0.25);
  color: color(--v-theme-on-surface, 0.85);
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: color(--v-theme-on-surface, 0.5);
  }

  &.active {
    background-color: color(--v-theme-primary);
    border-color: color(--v-theme-primary);
    color: color(--v-theme-on-primary);
  }

  &.pending {
    margin-left: auto;

    &.active {
      background-color: color(--v-theme-error);
      border-color: color(--v-theme-error);
    }
  }
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.state {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}

.empty {
  font-size: 14px;
  opacity: 0.6;
}
</style>
