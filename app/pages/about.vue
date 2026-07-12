<template>
  <div class="about-page">
    <h1 class="about-title">
      {{ $t('common_about') }}
    </h1>
    <p class="about-tagline">
      {{ $t('about_tagline') }}
    </p>
    <div class="about-body">
      <p>{{ $t('about_body_1') }}</p>
      <p>{{ $t('about_body_2') }}</p>
      <p>{{ $t('about_body_3') }}</p>
      <p>{{ $t('about_body_4') }}</p>
    </div>
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
  gap: 20px;
}

.about-title {
  font-size: 32px;
  font-weight: 600;
}

.about-tagline {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
}

.about-body {
  display: flex;
  flex-direction: column;
  gap: 16px;

  p {
    font-size: 16px;
    line-height: 1.6;
    opacity: 0.85;
    margin: 0;
  }
}
</style>
