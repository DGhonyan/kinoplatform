<template>
  <Header />

  <div class="layout-content">
    <slot />
  </div>

  <AppFooter />
</template>

<script lang="ts" setup>
import AppFooter from '@/components/AppFooter.vue'
import Header from '@/components/Header.vue'
</script>

<style scoped lang="scss">
.layout-content {
  width: 100%;
  height: 100%;
  padding: $base-padding;
}
</style>