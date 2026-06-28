<template>
  <v-dialog
    v-model="open"
    :max-width="maxWidth"
    :persistent="persistent"
    scrollable
  >
    <v-card
      rounded="xl"
      class="popup-card"
      :theme="theme || undefined"
    >
      <div class="popup-header">
        <v-btn
          v-if="showBack"
          class="header-icon back"
          variant="text"
          icon="mdi-chevron-left"
          size="small"
          :aria-label="$t('common_go_back')"
          @click="emit('back')"
        />
        <h2
          v-if="title"
          class="popup-title"
        >
          {{ title }}
        </h2>
        <v-btn
          v-if="!persistent"
          class="header-icon close"
          variant="text"
          icon="mdi-close"
          size="small"
          :aria-label="$t('common_cancel')"
          @click="open = false"
        />
      </div>

      <p
        v-if="description"
        class="popup-description"
      >
        {{ description }}
      </p>

      <div class="popup-body">
        <slot />
      </div>

      <div
        v-if="$slots.actions"
        class="popup-actions"
      >
        <slot name="actions" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
/**
 * Shared modal shell for the profile-completion popups. Wraps a theme-aware
 * v-card in a v-dialog and standardizes header (title + optional back/close),
 * an optional description line, a scrollable body, and an actions row.
 *
 * Nested-page UX (Projects/Experience) is the consumer's concern: it keeps its
 * own `view` ref, swaps the body slot's content, and toggles `showBack` +
 * listens to `@back` to return to the list view — no second dialog.
 */
const open = defineModel<boolean>({ required: true });

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    /** Persistent popups can't be dismissed by scrim/esc and hide the close button. */
    persistent?: boolean;
    maxWidth?: number | string;
    showBack?: boolean;
    /** Force a Vuetify theme on the card (e.g. 'light' when launched from a light page). */
    theme?: string;
  }>(),
  {
    title: '',
    description: '',
    persistent: false,
    maxWidth: 800,
    showBack: false,
    theme: '',
  },
);

const emit = defineEmits<{
  back: [];
}>();
</script>

<style scoped lang="scss">
.popup-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px;
  max-height: min(90vh, 760px);
}

.popup-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}

.popup-title {
  text-align: center;
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.header-icon {
  position: absolute;

  &.back {
    left: 0;
  }

  &.close {
    right: 0;
  }
}

.popup-description {
  text-align: center;
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

.popup-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 12px;
}

.popup-actions {
  display: flex;
  gap: 16px;

  > * {
    flex: 1;
  }
}
</style>
