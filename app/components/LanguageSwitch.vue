<template>
  <!-- Compact language switch for the header. Normally it lives in the header
       bar (`:disabled` teleport = render in place). While a PopupShell dialog is
       open it teleports to <body> and goes `position: fixed`, so it floats above
       the dialog's overlay — the header's own z-index:1 stacking context can't
       reach above a teleported v-dialog, so we step outside it instead. -->
  <Teleport
    to="body"
    :disabled="!isPopupOpen"
  >
    <v-menu
      location="bottom end"
      :z-index="2501"
    >
      <template #activator="{ props: menuProps }">
        <button
          type="button"
          class="lang-trigger"
          :class="{ floating: isPopupOpen }"
          v-bind="menuProps"
          :aria-label="$t('settings_language')"
        >
          <v-icon
            icon="mdi-earth"
            class="lang-icon"
          />
          <span class="lang-code">{{ locale.toUpperCase() }}</span>
        </button>
      </template>

      <v-list
        density="compact"
        min-width="160"
      >
        <v-list-item
          v-for="lang in languages"
          :key="lang.value"
          :active="locale === lang.value"
          :title="lang.title"
          @click="setLocale(lang.value)"
        />
      </v-list>
    </v-menu>
  </Teleport>
</template>

<script lang="ts" setup>
const { locale, setLocale, languages } = useAppLocale();
const { isPopupOpen } = useActivePopup();
</script>

<style scoped lang="scss">
.lang-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 14px;

  &:hover {
    opacity: 0.85;
  }
}

// Active only while teleported above a popup: pin to the top-right corner and
// sit above the dialog overlay (~2000). Explicit white keeps it legible on the
// scrim, since it's no longer inheriting the header's text color.
.lang-trigger.floating {
  position: fixed;
  top: 28px;
  right: 96px;
  z-index: 2500;
  color: #fff;
}

.lang-icon {
  font-size: 20px;
}

.lang-code {
  font-weight: 500;
}
</style>
