<template>
  <div
    class="field-card"
    :class="{ 'has-error': !!error }"
  >
    <div class="field-icon">
      <v-icon size="24">
        {{ icon }}
      </v-icon>
    </div>

    <div class="field-body">
      <div class="field-head">
        <span class="field-title">
          {{ $t(title) }}
          <span
            v-if="required"
            class="asterisk"
          > *</span>
        </span>
        <span
          v-if="description"
          class="field-description"
        >
          {{ $t(description) }}
        </span>
      </div>

      <div class="field-action">
        <slot />
      </div>

      <span
        v-if="error"
        class="field-error"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Card-style profile field used in the completion popups: an icon on the left,
 * and title + explanation + the action control stacked on the right. The
 * "action" is whatever the caller drops in the default slot — a Select, an
 * Input, a TextArea, a file-upload activator, or a button that opens a
 * secondary popup.
 *
 * `icon` defaults to the profile-photo placeholder; per-field Figma icons get
 * swapped in later by passing `icon`.
 */
withDefaults(
  defineProps<{
    /** i18n key for the field title. */
    title: string;
    /** i18n key for the explanation line (optional). */
    description?: string;
    /** Icon name (custom: set or mdi). Defaults to the profile-photo placeholder. */
    icon?: string;
    required?: boolean;
    /** Already-translated error string; renders a red line under the action. */
    error?: string;
  }>(),
  {
    description: '',
    icon: 'custom:camera-add',
    required: false,
    error: '',
  },
);
</script>

<style scoped lang="scss">
.field-card {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid color(--v-theme-on-surface, 0.12);
  background-color: color(--v-theme-on-surface, 0.03);
  transition: border-color 0.2s ease;
}

.field-card.has-error {
  border-color: color(--v-theme-error);
}

.field-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: color(--v-theme-primary);
  background-color: color(--v-theme-accent);
}

.field-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-title {
  font-size: 15px;
  font-weight: 600;
}

.asterisk {
  color: color(--v-theme-error);
}

.field-description {
  font-size: 13px;
  opacity: 0.7;
}

.field-error {
  font-size: 12px;
  color: color(--v-theme-error);
}
</style>
