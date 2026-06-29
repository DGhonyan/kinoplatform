<template>
  <div class="completion-banner">
    <div class="banner-text">
      <v-icon
        color="primary"
        size="20"
      >
        mdi-account-star-outline
      </v-icon>
      <div class="banner-copy">
        <span class="banner-title">{{ $t('profile_completion_title') }}</span>
        <span class="banner-subtitle">
          {{ $t('profile_completion_sections_left', { count: remaining }) }}
        </span>
      </div>
    </div>

    <div class="banner-actions">
      <Button
        size="small"
        @click="emit('open')"
      >
        {{ $t('profile_completion_cta') }}
      </Button>
      <Button
        variant="text"
        size="small"
        icon="mdi-close"
        :aria-label="$t('common_cancel')"
        @click="emit('dismiss')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from '~/components/Button.vue';

/**
 * Gentle nudge shown above the profile when optional sections are unfilled.
 * Parent owns the completeness math + dismissal state; this is presentation
 * plus two intents (open the completion flow, dismiss the banner).
 */
defineProps<{
  remaining: number;
}>();

const emit = defineEmits<{
  open: [];
  dismiss: [];
}>();
</script>

<style scoped lang="scss">
.completion-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid color(--v-theme-primary, 0.3);
  background-color: color(--v-theme-primary, 0.06);
  border-radius: 16px;
}

.banner-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-copy {
  display: flex;
  flex-direction: column;
}

.banner-title {
  font-size: 15px;
  font-weight: 600;
}

.banner-subtitle {
  font-size: 13px;
  opacity: 0.75;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
