<template>
  <li class="timeline-item">
    <span class="timeline-marker" />
    <div class="timeline-body">
      <span class="exp-title">{{ experience.position }} · {{ experience.company }}</span>
      <span class="exp-date">{{ experienceLine }}</span>
      <p
        v-if="experience.description"
        class="exp-desc"
      >
        {{ experience.description }}
      </p>
    </div>
  </li>
</template>

<script lang="ts" setup>
import type { Experience } from '~~/shared/types/user';

/**
 * A single entry in the profile's experience timeline. Renders as an <li> so it
 * slots straight into the parent <ol class="timeline"> — the connecting line
 * (and its :last-child suppression) is scoped here on the item itself.
 */
const props = defineProps<{
  experience: Experience;
  isMe: boolean;
}>();

const { t, locale } = useI18n();

const monthName = (m: number) =>
  new Date(2000, Math.max(0, m - 1), 1).toLocaleDateString(locale.value, { month: 'short' });

// employmentType · "Mon YYYY – Mon YYYY" (or "– Present" while current).
const experienceLine = computed(() => {
  if (props.isMe) {
    return 'to lead you in the summer · to join the black parade';
  }

  const e = props.experience;
  const start = `${monthName(e.startMonth)} ${e.startYear}`;
  const end = e.currentlyWorking
    ? t('onboarding_present')
    : e.endYear
      ? (e.endMonth ? `${monthName(e.endMonth)} ${e.endYear}` : String(e.endYear))
      : '';
  const range = end ? `${start} – ${end}` : start;
  return [t(e.employmentType), range].filter(Boolean).join(' · ');
});
</script>

<style scoped lang="scss">
.timeline-item {
  position: relative;
  padding-left: 28px;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }

  // Connecting line between dots.
  &::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 14px;
    bottom: -2px;
    width: 2px;
    background-color: color(--v-theme-accent, 0.35);
  }

  &:last-child::before {
    display: none;
  }
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: color(--v-theme-accent);
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-title {
  font-size: 16px;
  font-weight: 500;
}

.exp-date {
  font-size: 13px;
  opacity: 0.7;
}

.exp-desc {
  font-size: 14px;
  margin: 4px 0 0;
  opacity: 0.85;
}
</style>
