<template>
  <div class="home-container">
    <div class="home-left">
      <h1>This is a placeholder text for the home page honestly i'm not sure we even need this, we probably don't</h1>
    </div>
    <div class="home-right">
      <img src="https://media.istockphoto.com/id/1427212392/photo/production-team-shooting-some-video-movie-for-tv-commercial-with-studio-equipment-set.jpg?s=1024x1024&w=is&k=20&c=H9XfqarpBvCvDarwjB_LsrVefuIjk7Cy6mrtmeVK8UQ=" alt="Home Right" />
    </div>
  </div>
</template>

<script lang="ts" setup>
//
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