<template>
  <div class="tags">
    <span class="category-tag">
      {{ $t(`announcement_category_${category}`) }}
    </span>
    <span
      v-if="status"
      class="status-badge"
      :class="`status-${status}`"
    >
      {{ $t(`announcement_status_${status}`) }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { AnnouncementCategory, AnnouncementStatus } from '~~/shared/types/announcement';

/**
 * The category pill (+ optional status badge) shown above an announcement's
 * title. Shared by the board card and the detail page — they previously kept
 * separate copies of these styles, which had already drifted apart.
 *
 * `status` is intentionally opt-in: the public board hides it, "Mine" shows it,
 * and the detail page shows it only when the post isn't live yet.
 */
defineProps<{
  category: AnnouncementCategory;
  status?: AnnouncementStatus;
}>();
</script>

<style scoped lang="scss">
.tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;

  background-color: color(--v-theme-primary);
  color: color(--v-theme-on-primary);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;

  &.status-pending {
    background-color: color(--v-theme-warning);
    color: color(--v-theme-on-warning);
  }

  &.status-approved {
    background-color: color(--v-theme-success);
    color: color(--v-theme-on-success);
  }

  &.status-rejected {
    background-color: color(--v-theme-error);
    color: color(--v-theme-on-error);
  }
}
</style>
