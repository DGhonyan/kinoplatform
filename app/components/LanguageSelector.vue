<template>
  <v-select
    v-model="currentLocale"
    :items="languages"
    variant="outlined"
    density="compact"
    hide-details
    class="language-selector"
    @update:model-value="setLocale"
  >
    <template #selection="{ item }">
      <span class="language-code">{{ item.value.toUpperCase() }}</span>
    </template>
  </v-select>
</template>

<script lang="ts" setup>
import type { AppLocale } from '~/composables/useAppLocale';

// Shared locale logic (see useLocale). Saved locale is restored at app boot by
// plugins/restore-locale.client.ts, so `locale.value` is already correct here.
const { locale, setLocale, languages } = useLocale();

const currentLocale = ref<AppLocale>(locale.value as AppLocale);
</script>

<style scoped lang="scss">
.language-selector {
  max-width: 100px;
  min-width: 80px;
}

.language-code {
  font-weight: 500;
  font-size: 14px;
}
</style>
