<template>
  <div
    class="card"
    :class="{ 'card-glass': glass }"
    :style="styles"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
/**
 * The translucent rounded card used as the surface for auth pages and the
 * onboarding wizard. One place owns the look (background, radius, default
 * sizing) so changing it later is a one-file edit.
 *
 * `gap`, `maxWidth`, and `padding` are configurable per-instance; everything
 * else (color, radius, flex layout, self-centering) is opinionated.
 */
const props = withDefaults(
  defineProps<{
    /** Vertical gap between direct children, in pixels. */
    gap?: number;
    /** Card max-width, in pixels. */
    maxWidth?: number;
    /** Card max-height, in pixels. */
    maxHeight?: number;
    /** Inner padding, in pixels. */
    padding?: number;
    /** Frosted-glass variant: translucent fill + backdrop blur + soft glow. */
    glass?: boolean;
  }>(),
  {
    gap: 24,
    maxWidth: 830,
    maxHeight: 620,
    padding: 40,
    glass: true,
  },
);

const styles = computed(() => ({
  gap: `${props.gap}px`,
  maxWidth: `${props.maxWidth}px`,
  maxHeight: `${props.maxHeight}px`,
  padding: `${props.padding}px`,
}));
</script>

<style scoped lang="scss">
.card {
  align-self: center;
  justify-self: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
}

// Frosted-glass variant (registration wizard). The card sits over the hero
// cover image, so a translucent fill + backdrop blur lets the image show
// through, blurred. Figma's "background blur" is a 20→60 vertical ramp; CSS
// `backdrop-filter` is uniform, so we use the mid value. Alpha stays high
// enough (0.6) that the dark cover doesn't sink the card's dark text.
.card.card-glass {
  background-color: color(--v-theme-white, 0.5);
  backdrop-filter: blur(10px);
  border: rgba(255, 255, 255, 0.4);
  -webkit-backdrop-filter: blur(10px); // Safari
  border: 1px solid color(--v-theme-white, 0.25);
  // Figma drop shadow: X 0, Y 20, Blur 40, Spread 0, #FFFFFF @ 10%.
  box-shadow: 0 20px 40px 0 color(--v-theme-white, 0.1);
}
</style>
