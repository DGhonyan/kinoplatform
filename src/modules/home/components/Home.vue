<template>
  <div class="home-container">
    <div class="home-left">
      <span>This is a placeholder text for the home pagepagep agepa gepagepagepagepa gepagepagepa gepagepagepagepage</span>
      <v-icon class="home-arrow" icon="mdi-arrow-right" size="50" color="primary" @click="navigateTo('Crew')" />
    </div>
    <div class="home-right">
      <img src="https://media.istockphoto.com/id/1427212392/photo/production-team-shooting-some-video-movie-for-tv-commercial-with-studio-equipment-set.jpg?s=1024x1024&w=is&k=20&c=H9XfqarpBvCvDarwjB_LsrVefuIjk7Cy6mrtmeVK8UQ=" alt="Home Right" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouteHelpers } from '@/composables/useRouteHelpers'
const { navigateTo } = useRouteHelpers()
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;

  padding: 120px;
}

.home-left {
  max-width: 50%;

  span {
    font-size: 24px;
    color: color(--v-theme-gray);
    padding-right: 20px;
  }

  .home-arrow {
    border-radius: 8px;
    background-color: color(--v-theme-gray100);
  }
}

.home-right {
  max-width: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>