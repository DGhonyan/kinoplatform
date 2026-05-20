<template>
  <div class="home-bg" aria-hidden="true" />

  <div class="home-container">
    <div class="home-left">
      <span class="home-description">{{ $t('home_description') }}</span>

      <v-icon
        class="home-arrow"
        icon="mdi-arrow-right"
        size="50"
        color="primary"
        @click="navigateTo('/crew')"
      />
    </div>
    <div class="home-right">
      <img
        src="https://media.istockphoto.com/id/1427212392/photo/production-team-shooting-some-video-movie-for-tv-commercial-with-studio-equipment-set.jpg?s=1024x1024&w=is&k=20&c=H9XfqarpBvCvDarwjB_LsrVefuIjk7Cy6mrtmeVK8UQ="
        alt="Home Right"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  bodyAttrs: { class: 'page-home' },
});
</script>

<style lang="scss" scoped>
.home-bg {
  position: fixed;
  inset: 0;
  background: url('../assets/home-cover.png') center / cover no-repeat;
  z-index: -1;
  pointer-events: none;
}

.home-container {
  position: relative;  /* establishes stacking context above .home-bg */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
  padding: 120px;
}

.home-left {
  max-width: 50%;

  .home-description {
    font-size: 24px;
    color: color(--v-theme-gray);
    padding-right: 20px;
    white-space: pre-line;
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

<style lang="scss">
/* Punch a transparent hole through every Vuetify layer that paints white,
   only while the home page is mounted (body.page-home is present). */
body.page-home,
body.page-home .v-application,
body.page-home .v-application__wrap,
body.page-home .v-main {
  background: transparent !important;
}

/* Re-skin the header for this page only — see Header.vue for the token API. */
body.page-home .header-content {
  --header-fg: #fbfbfb;
  --header-accent: #fbfbfb;
}

/* Vuetify buttons compute text color from the `color` prop, not CSS vars,
   so override them directly. Same for the language selector. */
body.page-home .header-content .v-btn,
body.page-home .header-content .v-field__input,
body.page-home .header-content .v-field__outline {
  color: #fbfbfb !important;
}
</style>
