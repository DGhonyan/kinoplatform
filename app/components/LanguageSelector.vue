<template>
  <v-select
    v-model="currentLocale"
    :items="languages"
    variant="outlined"
    density="compact"
    hide-details
    class="language-selector"
    @update:model-value="changeLanguage"
  >
    <template #selection="{ item }">
      <span class="language-code">{{ item.value.toUpperCase() }}</span>
    </template>
  </v-select>
</template>

<script lang="ts" setup>
type AppLocale = 'en' | 'hy';

const { locale } = useI18n();

const currentLocale = ref<AppLocale>(locale.value as AppLocale);

const languages: { title: string; value: AppLocale }[] = [
  { title: 'English', value: 'en' },
  { title: 'Հայերեն', value: 'hy' },
];

const changeLanguage = (newLocale: AppLocale) => {
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);
};

onMounted(() => {
  const savedLocale = localStorage.getItem('locale') as AppLocale | null;
  if (savedLocale === 'en' || savedLocale === 'hy') {
    locale.value = savedLocale;
    currentLocale.value = savedLocale;
  }
});
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
