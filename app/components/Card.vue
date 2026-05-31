<template>
  <div
    class="card"
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
    /** Inner padding, in pixels. */
    padding?: number;
  }>(),
  {
    gap: 24,
    maxWidth: 640,
    padding: 40,
  },
);

const styles = computed(() => ({
  gap: `${props.gap}px`,
  maxWidth: `${props.maxWidth}px`,
  padding: `${props.padding}px`,
}));
</script>

<style scoped lang="scss">
.card {
  align-self: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
}
</style>
