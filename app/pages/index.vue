<template>
  <div class="home-page">
    <HomeCrewShowcase />
  </div>
</template>

<script setup lang="ts">
// Home is public (see auth.global.ts). The hero now lives in the header cover —
// home-cover.png banner, the Bebas slogan, and the Join/Login CTAs for guests.
definePageMeta({
  header: {
    cover: true,
    coverImage: 'home',
    slogan: 'home_hero_slogan',
    authCta: true,
  },
});
</script>

<style lang="scss" scoped>
.home-page {
  width: 100%;
}
</style>
