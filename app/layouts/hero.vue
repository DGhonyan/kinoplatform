<template>
  <div
    class="hero-bg"
    aria-hidden="true"
  >
    <img
      src="../assets/home-cover.png"
      alt="Home Cover"
      class="hero-bg-image"
    >
  </div>

  <Header />

  <!-- Hero pages sit on the dark cover image but keep the light-theme card
       look (white surface, dark text) while the app default stays dark.
       v-theme-provider hands descendant Vuetify components the light theme via
       inject, but with `with-background` off it renders no element of its own and
       drops `class` — so wrap the slot in a real element that also carries
       Vuetify's `v-theme--light` class. That re-resolves CSS `var(--v-theme-*)`
       (and the inherited text color below) to light for the plain markup in the
       card, which inject alone doesn't cover. -->
  <v-theme-provider theme="light">
    <div class="layout-content v-theme--light">
      <slot />
    </div>
  </v-theme-provider>
</template>

<script lang="ts" setup>
// Add a body class while this layout is mounted so global styles below can
// punch through Vuetify's white surfaces and recolor the header.
useHead({
  bodyAttrs: { class: 'layout-hero' },
});
</script>

<style scoped lang="scss">
.hero-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.layout-content {
  width: 100%;
  height: 100%;
  padding: $base-padding;
  // This element carries `v-theme--light` (see template), so on-surface
  // re-resolves to the light value here — keeping plain text dark inside the
  // white card even though the app default theme is dark.
  color: color(--v-theme-on-surface);
}
</style>

<style lang="scss">
/* Hero pages (home, login, register, forgot/reset password) sit on top of a
   full-bleed cover image. Punch transparency through every Vuetify layer that
   paints white so the image actually shows. */
body.layout-hero,
body.layout-hero .v-application,
body.layout-hero .v-application__wrap,
body.layout-hero .v-main {
  background: transparent !important;
}

/* Re-skin the header for hero pages. See Header.vue for the token API. */
body.layout-hero .header-content {
  --header-fg: #fbfbfb;
  --header-accent: #fbfbfb;
}
</style>
