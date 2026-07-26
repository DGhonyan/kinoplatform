<template>
  <div
    class="carousel"
    :style="{ '--carousel-control': controlCssColor }"
  >
    <button
      v-if="overflowing"
      type="button"
      class="carousel-control"
      :class="{ 'is-disabled': !canPrev }"
      :aria-label="$t('common_go_back')"
      @click="step(-1)"
    >
      <v-icon size="22">
        mdi-chevron-left
      </v-icon>
    </button>

    <div
      ref="viewport"
      class="carousel-viewport"
      @scroll="measure"
    >
      <div
        v-for="(item, index) in items"
        :key="keyFor(item, index)"
        class="carousel-item"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        />
      </div>
    </div>

    <button
      v-if="overflowing"
      type="button"
      class="carousel-control"
      :class="{ 'is-disabled': !canNext }"
      :aria-label="$t('common_next')"
      @click="step(1)"
    >
      <v-icon size="22">
        mdi-chevron-right
      </v-icon>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T">
/**
 * Reusable strip carousel: renders each item through the `#item` scoped slot and
 * steps ONE item per arrow click (not a whole page), so items are never clipped
 * mid-view. `loop` wraps around at the ends; `controlColor` (a theme token or any
 * CSS color) tints the prev/next controls. Arrows only appear when the strip
 * overflows its viewport.
 */
const props = withDefaults(defineProps<{
  items: readonly T[];
  keyField?: string;
  controlColor?: string;
  loop?: boolean;
}>(), {
  controlColor: 'primary',
  loop: false,
});

const THEME_TOKENS = ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'];
const controlCssColor = computed(() =>
  THEME_TOKENS.includes(props.controlColor)
    ? `rgb(var(--v-theme-${props.controlColor}))`
    : props.controlColor,
);

const keyFor = (item: T, index: number): string | number => {
  if (props.keyField) {
    const value = (item as Record<string, unknown>)[props.keyField];
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return index;
};

const EPS = 2;

const viewport = ref<HTMLElement | null>(null);
const overflowing = ref(false);
const atStart = ref(true);
const atEnd = ref(false);

const canPrev = computed(() => props.loop || !atStart.value);
const canNext = computed(() => props.loop || !atEnd.value);

const measure = () => {
  const vp = viewport.value;
  if (!vp) return;
  const max = vp.scrollWidth - vp.clientWidth;
  overflowing.value = max > EPS;
  atStart.value = vp.scrollLeft <= EPS;
  atEnd.value = vp.scrollLeft >= max - EPS;
};

// Each item is a direct child of the (positioned) viewport, so its offsetLeft is
// exactly the scroll position that brings it flush to the left edge.
const step = (dir: 1 | -1) => {
  const vp = viewport.value;
  if (!vp) return;
  const children = Array.from(vp.children) as HTMLElement[];
  if (!children.length) return;

  const cur = vp.scrollLeft;
  const max = vp.scrollWidth - vp.clientWidth;

  if (dir === 1) {
    if (cur >= max - EPS) {
      if (props.loop) vp.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    const next = children.find(c => c.offsetLeft > cur + EPS);
    vp.scrollTo({ left: next ? next.offsetLeft : max, behavior: 'smooth' });
  }
  else {
    if (cur <= EPS) {
      if (props.loop) vp.scrollTo({ left: max, behavior: 'smooth' });
      return;
    }
    const before = children.filter(c => c.offsetLeft < cur - EPS);
    const prev = before[before.length - 1];
    vp.scrollTo({ left: prev ? prev.offsetLeft : 0, behavior: 'smooth' });
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  measure();
  if (viewport.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport.value);
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

// Re-measure when the item set changes (add/remove).
watch(() => props.items.length, () => nextTick(measure));
</script>

<style scoped lang="scss">
.carousel {
  display: flex;
  align-items: center;
  gap: 8px;
  // Anchor for the overlaid controls on narrow screens (see the mobile block).
  position: relative;
}

.carousel-viewport {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scroll-behavior: smooth;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.carousel-item {
  flex: 0 0 auto;
  scroll-snap-align: start;
}

.carousel-control {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  background: var(--carousel-control);
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;

  &:hover {
    transform: scale(1.06);
  }

  &.is-disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}

// Two inline 36px arrows plus gaps eat ~90px of a ~290px row, which is why they
// used to be hidden outright on phones. Float them over the strip's edges
// instead: still tappable, but they cost the viewport no width.
@include mobile {
  .carousel-control {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    // The strip scrolls under them, so keep them legible over artwork.
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);

    &:first-child {
      left: 4px;
    }

    &:last-child {
      right: 4px;
    }

    // The base rule's hover scale would drop the translate and un-center it.
    &:hover {
      transform: translateY(-50%) scale(1.06);
    }
  }
}
</style>
