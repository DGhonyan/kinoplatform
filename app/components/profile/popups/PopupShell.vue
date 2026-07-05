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
        <div class="header-title">
          <Button
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
          <LanguageSwitch
            v-if="languageSwitch"
            class="header-lang"
          />
          <Button
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
      </div>

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
    /**
     * Show a language switch in the header. For persistent onboarding popups
     * (e.g. Essentials), where the dialog scrim buries the header switch and the
     * user has no other language control yet.
     */
    languageSwitch?: boolean;
  }>(),
  {
    title: '',
    description: '',
    persistent: false,
    maxWidth: 800,
    showBack: false,
    theme: '',
    languageSwitch: false,
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-title {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.popup-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  flex: 1;
}

// Pin the language switch to the right (robust even when there's no title).
.header-lang {
  margin-left: auto;
  flex-shrink: 0;
}

.popup-description {
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
