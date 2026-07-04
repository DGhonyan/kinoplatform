<template>
  <!-- Compact language menu. Lives in the header for guests/members, and is also
       dropped inside PopupShell's header for the persistent onboarding popup
       (where the header switch would be buried under the dialog scrim). Being a
       plain v-menu, its dropdown stacks above whatever overlay it's opened from. -->
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        class="lang-trigger"
        v-bind="menuProps"
        :aria-label="$t('settings_language')"
      >
        <v-icon
          icon="custom:globe"
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
</template>

<script lang="ts" setup>
const { locale, setLocale, languages } = useAppLocale();
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

.lang-icon {
  font-size: 20px;
}

.lang-code {
  font-weight: 500;
}
</style>
