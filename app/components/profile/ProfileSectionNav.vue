<template>
  <nav class="section-nav">
    <button
      v-for="s in sections"
      :key="s.id"
      type="button"
      class="nav-btn"
      :class="{ active: s.id === activeId }"
      @click="scrollTo(s.id)"
    >
      {{ $t(s.label) }}
    </button>
  </nav>
</template>

<script lang="ts" setup>
// Section tabs. Scrolls by DOM id (global, so no events needed to reach the
// parent's sections) and scroll-spies the active one via IntersectionObserver.
const props = defineProps<{
  sections: { id: string; label: string }[];
}>();

const activeId = ref('');

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      // Whichever tracked section currently sits highest within the trigger band.
      const top = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) activeId.value = top.target.id;
    },
    // A thin band near the top of the viewport acts as the "you are here" line.
    { rootMargin: '-15% 0px -75% 0px', threshold: 0 },
  );
  for (const s of props.sections) {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  }
};

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  activeId.value = id;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

onMounted(() => {
  activeId.value = props.sections[0]?.id ?? '';
  setupObserver();
});
// Sections appear/disappear as profile data loads or is edited — re-observe.
watch(() => props.sections.map(s => s.id).join('|'), () => nextTick(setupObserver));
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped lang="scss">
.section-nav {
  width: fit-content;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  // The collective underline; each active tab paints its own segment over it.
  border-bottom: 2px solid color(--v-theme-on-surface, 0.4);
}

.nav-btn {
  padding: 6px 12px;
  background: none;
  border: none;
  // Transparent tab indicator, pulled down onto the row's border line.
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
  transition: color 0.15s ease, opacity 0.15s ease, border-color 0.15s ease;

  &:hover {
    opacity: 1;
  }

  &.active {
    border-bottom-color: color(--v-theme-primary);
    opacity: 1;
  }
}

/* ── Mobile: full-width row that scrolls sideways instead of wrapping ── */
@include mobile {
  .section-nav {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    // A scroll container would clip the active tab's indicator (it hangs 2px
    // below the row), so paint the collective line as a background instead.
    border-bottom: none;
    background: linear-gradient(to top, color(--v-theme-on-surface, 0.4) 2px, transparent 2px);

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .nav-btn {
    flex-shrink: 0;
    // No negative margin to hide now that the line is a background.
    margin-bottom: 0;
    padding: 6px 10px;
    white-space: nowrap;
    // The nav is now a scroll container, so it clips an outset focus ring on
    // every edge. Draw the ring inside the button rather than lose it.
    outline-offset: -2px;

    // Align the first tab (and its indicator) with the rest of the column.
    &:first-child {
      padding-left: 0;
    }
  }
}
</style>
