<template>
  <div class="layout">
    <Header v-bind="header" />

    <div class="layout-content">
      <slot />
    </div>

    <Footer />
  </div>
</template>

<script lang="ts" setup>
import type { HeaderConfig } from '~~/shared/types/header';

// Pages opt into the header cover/slogan via `definePageMeta({ header: {...} })`.
const route = useRoute();
const header = computed<HeaderConfig>(() => route.meta.header ?? {});
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-content {
  // Grow to fill the viewport so the footer sits at the bottom on short pages.
  flex: 1 0 auto;
  width: 100%;
  padding: $base-padding;
}
</style>
