<template>
  <NuxtLink
    :to="`/announcements/${announcement._id}`"
    class="announcement-card"
  >
    <AnnouncementTags
      :category="announcement.category"
      :status="mode === 'mine' ? announcement.status : undefined"
    />

    <h3 class="card-title">
      {{ announcement.title }}
    </h3>

    <span
      v-if="announcement.deadline"
      class="card-deadline"
      :class="{ expired: isExpired }"
    >
      <v-icon size="15">
        mdi-clock-outline
      </v-icon>
      {{ isExpired ? $t('announcement_deadline_passed') : $t('announcement_deadline', { date: deadlineText }) }}
    </span>

    <p
      v-if="announcement.description"
      class="card-desc"
    >
      {{ announcement.description }}
    </p>

    <div class="card-footer">
      <!-- Admin moderation actions (don't trigger the card's navigation). -->
      <template v-if="mode === 'moderate'">
        <Button
          color="primary"
          size="small"
          @click.stop.prevent="emit('approve', announcement._id)"
        >
          {{ $t('announcement_approve') }}
        </Button>
        <Button
          variant="secondary"
          color="error"
          size="small"
          @click.stop.prevent="emit('reject', announcement._id)"
        >
          {{ $t('announcement_reject') }}
        </Button>
      </template>

      <!-- Author's own post: delete their own -->
      <Button
        v-else-if="mode === 'mine'"
        variant="text"
        color="error"
        size="small"
        prepend-icon="mdi-delete-outline"
        @click.stop.prevent="emit('delete', announcement._id)"
      >
        {{ $t('common_delete') }}
      </Button>

      <!-- Public: the whole card links to the detail page. -->
      <span
        v-else
        class="card-view"
      >
        <span>{{ $t('announcement_view') }}</span>
        <v-icon size="15">mdi-arrow-right</v-icon>
      </span>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { Announcement } from '~~/shared/types/announcement';
import Button from '~/components/Button.vue';
import AnnouncementTags from '~/components/announcements/AnnouncementTags.vue';
import { formatDate, todayLocalDate } from '~/utils/dates';

const props = withDefaults(
  defineProps<{
    announcement: Announcement;
    /**
     * 'public' → CTA button; 'moderate' → admin approve/reject; 'mine' → the
     * author's own post (status badge + delete). One field, no invalid combos.
     */
    mode?: 'public' | 'moderate' | 'mine';
  }>(),
  { mode: 'public' },
);

const emit = defineEmits<{
  approve: [id: string];
  reject: [id: string];
  delete: [id: string];
}>();

const { locale } = useI18n();

const deadlineText = computed(() =>
  props.announcement.deadline ? formatDate(props.announcement.deadline, locale.value) : '',
);
// Date-only string compare — no Date parsing, so no timezone off-by-one.
const isExpired = computed(
  () => !!props.announcement.deadline && props.announcement.deadline < todayLocalDate(),
);
</script>

<style scoped lang="scss">
.announcement-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  // Containers that lay the cards out themselves (the detail page's related
  // strip) override this to let their grid track own the width — same contract
  // as UserCard's --user-card-width.
  width: var(--announcement-card-width, 320px);
  max-width: 100%;
  min-width: 0;
  padding: 18px;
  border: 1px solid color(--v-theme-on-surface, 0.14);
  border-radius: 14px;
  background-color: color(--v-theme-on-surface, 0.03);
  // The whole card is a link to the detail page.
  text-decoration: none;
  color: inherit;
  transition: border-color 0.12s ease, transform 0.12s ease;

  &:hover {
    border-color: color(--v-theme-primary, 0.5);
    transform: translateY(-2px);
  }
}

.card-view {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  span {
    text-decoration: underline;
  }
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.card-deadline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: color(--v-theme-error);

  &.expired {
    color: color(--v-theme-on-surface, 0.5);
    font-weight: 500;
  }
}

.card-desc {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.8;
  // Clamp to 2 lines (per the spec's card structure).
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
}
</style>
