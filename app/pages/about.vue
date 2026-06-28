<template>
  <div class="about-page">
    <h1 class="about-title">
      {{ $t('common_about') }}
    </h1>
    <p class="about-intro">
      {{ $t('about_intro') }}
    </p>
  </div>
</template>

<script setup lang="ts">
// Public page (see auth.global.ts) — reachable by logged-out visitors, which is
// why its header nav link is marked `public` in Header.vue.
</script>

<style lang="scss" scoped>
.about-page {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-title {
  font-size: 32px;
  font-weight: 600;
}

.about-intro {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.85;
}
</style>
