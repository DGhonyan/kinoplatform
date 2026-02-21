<template>
  <v-app>
    <router-view />
    <Loader />
  </v-app>
</template>

<script lang="ts" setup>
import Loader from '@/components/Loader.vue';
</script>
