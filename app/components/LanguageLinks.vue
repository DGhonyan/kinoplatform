<template>
  <!-- Multi-root fragment: renders straight into whichever <v-list> hosts it,
       so the compact header switch and the collapsed menu share one definition
       of what a language row looks like. -->
  <v-list-item
    v-for="lang in languages"
    :key="lang.value"
    :active="locale === lang.value"
    :title="lang.title"
    @click="setLocale(lang.value)"
  />
</template>

<script lang="ts" setup>
const { locale, setLocale, languages } = useAppLocale();
</script>
