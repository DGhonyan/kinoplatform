<template>
  <div v-if="loading" class="loader">
    <v-progress-circular indeterminate color="primary" size="50" width="5" />
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';

const appStore = useAppStore();
const { loading } = storeToRefs(appStore);
</script>

<style scoped lang="scss">
.loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.3);

  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style>