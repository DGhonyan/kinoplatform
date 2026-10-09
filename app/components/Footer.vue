<template>
  <footer class="app-footer">
    <span>© {{ year }} Kinoplatform</span>
    <NuxtLink
      to="/privacy"
      class="footer-link"
    >
      {{ $t('common_privacy_policy') }}
    </NuxtLink>
  </footer>
</template>

<script lang="ts" setup>
const year = new Date().getFullYear();
</script>

<style scoped lang="scss">
.app-footer {
  flex-shrink: 0;
  padding: 20px $base-padding;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 20px;
  font-size: 13px;
  color: color(--v-theme-on-surface, 0.55);
}

.footer-link {
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
