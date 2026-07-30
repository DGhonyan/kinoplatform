<template>
  <!-- Cover hero band: the Bebas slogan + optional logged-out CTAs. Sits over
       the cover image (which Header paints across the whole header). -->
  <div
    class="header-hero"
    :class="{ 'hero-centered': centered }"
  >
    <p
      v-if="slogan"
      class="header-slogan"
    >
      {{ $t(slogan) }}
    </p>

    <div
      v-if="showCta"
      class="header-cta"
    >
      <Button
        color="primary"
        rounded="pill"
        @click="navigateTo('/register')"
      >
        {{ $t('home_cta_join') }}
      </Button>
      <Button
        color="white"
        text-color="primary"
        rounded="pill"
        @click="navigateTo('/login')"
      >
        {{ $t('home_cta_login') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from '~/components/Button.vue';

defineProps<{
  slogan?: string;
  /** Show Join Us / I'm-already-a-member CTAs (logged-out only). */
  showCta: boolean;
  /** Center the band (cover-below-nav pages) vs. top-left align it (home). */
  centered: boolean;
}>();
</script>

<style scoped lang="scss">
.header-hero {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  // Home hero is left-aligned; the 16px padding matches $base-padding so the
  // slogan lines up under the "Kinoplatform" title.
  align-items: flex-start;
  gap: 28px;
  padding: 40px 16px 64px;
  text-align: left;
}

// Cover-below-the-nav pages (crew): the band is shorter, so center the slogan
// in it (both axes) with symmetric padding instead of top/left-aligning it.
.header-hero.hero-centered {
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding-top: 40px;
  padding-bottom: 40px;
  text-align: center;
}

.header-slogan {
  margin: 0;
  font-family: 'Bebas Neue', sans-serif;
  text-transform: uppercase;
  font-size: 64px;
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: 1px;
  // Honor the `\n` in the slogan i18n value as a real line break.
  white-space: pre-line;
  color: #fbfbfb;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.header-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

@include mobile {
  .header-slogan {
    font-size: 40px;
  }
}
</style>
