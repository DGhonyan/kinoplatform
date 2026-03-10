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
    <template v-slot:selection="{ item }">
      <span class="language-code">{{ item.value.toUpperCase() }}</span>
    </template>
  </v-select>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const currentLocale = ref(locale.value);

const languages = [
  { title: 'English', value: 'en' },
  { title: 'Հայերեն', value: 'hy' },
];

const changeLanguage = (newLocale: string) => {
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);
};

onMounted(() => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale) {
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
