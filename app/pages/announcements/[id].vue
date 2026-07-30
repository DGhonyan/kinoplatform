<template>
  <div class="announcement-detail">
    <NuxtLink
      to="/announcements"
      class="back-link"
    >
      <v-icon size="18">
        mdi-arrow-left
      </v-icon>
      {{ $t('common_announcements') }}
    </NuxtLink>

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

    <p
      v-else-if="!announcement"
      class="state empty"
    >
      {{ $t('error_announcement_not_found') }}
    </p>

    <template v-else>
      <article class="article">
        <!-- Status only when it isn't live yet — an approved post needs no badge. -->
        <AnnouncementTags
          :category="announcement.category"
          :status="announcement.status !== 'approved' ? announcement.status : undefined"
        />

        <h1 class="detail-title">
          {{ announcement.title }}
        </h1>

        <div class="meta">
          <span
            v-if="postedText"
            class="posted"
          >
            <v-icon size="15">
              mdi-calendar-blank-outline
            </v-icon>
            {{ postedText }}
          </span>
          <span
            v-if="announcement.deadline"
            class="detail-deadline"
            :class="{ expired: isExpired }"
          >
            <v-icon size="15">
              mdi-clock-outline
            </v-icon>
            {{ isExpired
              ? $t('announcement_deadline_passed')
              : $t('announcement_deadline', { date: deadlineText }) }}
          </span>
        </div>

        <!-- Short description doubles as the lead paragraph; the body carries
             the full text (so a body-less post still reads fine). -->
        <p
          v-if="announcement.description"
          class="detail-lead"
        >
          {{ announcement.description }}
        </p>

        <p
          v-if="announcement.body"
          class="detail-body"
        >
          {{ announcement.body }}
        </p>

        <Button
          v-if="ctaUrl"
          color="primary"
          size="large"
          :href="ctaUrl"
          target="_blank"
          rel="noopener noreferrer"
          append-icon="mdi-open-in-new"
          class="detail-cta"
        >
          {{ $t(`announcement_cta_${announcement.ctaType}`) }}
        </Button>
      </article>

      <!-- A single announcement is a thin page — surface the rest of the board
           underneath, same-category first so it reads as "related". -->
      <section
        v-if="more.length"
        class="more"
      >
        <h2 class="more-title">
          {{ $t('announcement_more') }}
        </h2>
        <div class="more-grid">
          <AnnouncementCard
            v-for="a in more"
            :key="a._id"
            :announcement="a"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Announcement, AnnouncementDetail } from '~~/shared/types/announcement';
import Button from '~/components/Button.vue';
import AnnouncementCard from '~/components/announcements/AnnouncementCard.vue';
import AnnouncementTags from '~/components/announcements/AnnouncementTags.vue';
import { safeExternalUrl } from '~/utils/safeUrl';
import { formatDate, todayLocalDate } from '~/utils/dates';

// Gated route (not in the public-paths allowlist) — a logged-out click on a card
// is bounced to /login?redirect=… by the auth middleware, then returns here.
const route = useRoute();
const { locale } = useI18n();
const announcementStore = useAnnouncementStore();

const MORE_COUNT = 3;

const announcement = ref<AnnouncementDetail | null>(null);
const more = ref<Announcement[]>([]);
const loading = ref(true);

const ctaUrl = computed(() => safeExternalUrl(announcement.value?.link ?? ''));
const deadlineText = computed(() =>
  announcement.value?.deadline ? formatDate(announcement.value.deadline, locale.value) : '',
);
const postedText = computed(() =>
  announcement.value?.createdAt ? formatDate(announcement.value.createdAt, locale.value) : '',
);
const isExpired = computed(
  () => !!announcement.value?.deadline && announcement.value.deadline < todayLocalDate(),
);

// Drop this post from the board listing and float same-category ones to the
// front, so the strip reads as "related" rather than arbitrary.
const relatedTo = (current: AnnouncementDetail, all: Announcement[]) =>
  all
    .filter(a => a._id !== current._id)
    .sort((a, b) =>
      Number(b.category === current.category) - Number(a.category === current.category),
    )
    .slice(0, MORE_COUNT);

// Watched, not onMounted: the "more" cards reuse this route, so onMounted
// wouldn't refire. loadSeq guards against out-of-order responses.
let loadSeq = 0;
watch(
  () => route.params.id,
  async (id) => {
    if (!id) return;
    const seq = ++loadSeq;
    loading.value = true;
    more.value = [];

    const [data, all] = await Promise.all([
      announcementStore.getAnnouncement(String(id)),
      announcementStore.listAnnouncements(),
    ]);
    if (seq !== loadSeq) return; // superseded by a newer navigation

    announcement.value = data;
    loading.value = false;
    more.value = data && all ? relatedTo(data, all) : [];
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.announcement-detail {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  font-size: 14px;
  color: color(--v-theme-on-surface, 0.7);
  text-decoration: none;

  &:hover {
    color: color(--v-theme-on-surface);
  }
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

.article {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-title {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  overflow-wrap: anywhere;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.posted {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  opacity: 0.6;
}

.detail-deadline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: color(--v-theme-error);

  &.expired {
    color: color(--v-theme-on-surface, 0.5);
    font-weight: 500;
  }
}

.detail-lead {
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.95;
  overflow-wrap: anywhere;
}

.detail-body {
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
  opacity: 0.85;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.detail-cta {
  align-self: flex-start;
  margin-top: 8px;
}

.more {
  border-top: 1px solid color(--v-theme-on-surface, 0.14);
  padding-top: 24px;
}

.more-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
}

// The card is a fixed 320px on the board; here the grid track owns the width so
// the strip fills the article column evenly (3-up, collapsing to 1 when narrow).
.more-grid {
  --announcement-card-width: auto;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
</style>
