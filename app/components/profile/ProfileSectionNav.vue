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
/**
 * In-profile section tabs. Scrolls to a section by its DOM id — ids are global,
 * so the nav can reach the sections that live in the parent without any events —
 * and highlights whichever section is currently in view via an IntersectionObserver
 * scroll-spy. The parent decides which sections exist and passes them in.
 */
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
</style>
