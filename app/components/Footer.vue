<template>
  <footer class="app-footer">
    <span>© {{ year }} Kinoplatform</span>
  </footer>
</template>

<script lang="ts" setup>
const year = new Date().getFullYear();
</script>

<style scoped lang="scss">
.app-footer {
  flex-shrink: 0;
  padding: 20px $base-padding;
  text-align: center;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
</style>
