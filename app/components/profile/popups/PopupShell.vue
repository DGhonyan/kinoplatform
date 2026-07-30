<template>
  <v-dialog
    v-model="open"
    :max-width="maxWidth"
    :persistent="persistent"
    content-class="popup-shell-dialog"
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

      <!-- Body is a <form> for Enter-to-submit; the hidden button enables implicit submission. -->
      <form
        class="popup-body"
        @submit.prevent="emit('submit')"
      >
        <slot />
        <button
          type="submit"
          class="popup-hidden-submit"
          aria-hidden="true"
          tabindex="-1"
        />
      </form>

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
// Shared modal shell: standardized header, optional description, scrollable
// body, actions row. Nested-page UX (`showBack` + `@back`) is the consumer's concern.
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
    // Language switch in the header — for persistent onboarding popups, where
    // the scrim buries the app header's switch and no other control exists yet.
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
  submit: [];
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
  // Query anchor for the forms inside: a dialog's width stops tracking the
  // viewport, so rows size themselves off THIS instead of media queries.
  container-type: inline-size;
}

.popup-hidden-submit {
  display: none;
}

.popup-actions {
  display: flex;
  gap: 16px;

  > * {
    flex: 1;
  }
}

@include mobile {
  .popup-card {
    gap: 16px;
    padding: 20px 16px;
    // The dialog wrapper owns the height budget on mobile (see the rule below).
    max-height: 100%;
  }

  .popup-title {
    font-size: 18px;
  }

  .popup-body {
    padding-right: 4px;
  }

  // Two large buttons rarely survive a 320px row; stack them, primary last.
  .popup-actions {
    flex-direction: column;
    gap: 12px;

    > * {
      flex: none;
    }
  }
}
</style>

<!-- Not scoped: the overlay is teleported out of this subtree, so `content-class` is the only handle. -->
<style lang="scss">
@include mobile {
  .v-dialog > .v-overlay__content.popup-shell-dialog {
    // Vuetify reserves 24px on every side; give a phone most of that back.
    margin: 12px;
    width: calc(100% - 24px);
    max-width: calc(100% - 24px);
    max-height: calc(100% - 24px);
  }
}
</style>
