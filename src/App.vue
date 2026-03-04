<template>
  <v-app>
    <router-view />
    <Loader />
    <Message />
  </v-app>
</template>

<script lang="ts" setup>
import Loader from '@/components/Loader.vue';
import Message from '@/components/Message.vue';
</script>
