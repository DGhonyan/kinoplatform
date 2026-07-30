<template>
  <div class="body-map">
    <div class="figures">
      <div
        v-for="figure in figures"
        :key="figure.view"
        class="figure"
      >
        <span class="figure-label">{{ $t(`tattoo_view_${figure.view}`) }}</span>
        <svg
          :viewBox="figure.viewBox"
          class="figure-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            v-for="region in figure.regions"
            :key="region.id"
            class="region"
            :class="{ selected: selectedSet.has(region.id) }"
            role="button"
            tabindex="0"
            :aria-pressed="selectedSet.has(region.id)"
            :aria-label="regionLabel(region.id)"
            @click="toggle(region.id)"
            @keydown.enter.prevent="toggle(region.id)"
            @keydown.space.prevent="toggle(region.id)"
          >
            <path
              v-for="(d, i) in region.paths"
              :key="i"
              :d="d"
              fill-rule="evenodd"
            />
          </g>
        </svg>
      </div>
    </div>

    <span class="hint">{{ $t('tattoo_selected_count', { count: modelValue.length }) }}</span>
  </div>
</template>

<script lang="ts" setup>
import {
  FRONT_REGIONS,
  BACK_REGIONS,
  FRONT_VIEWBOX,
  BACK_VIEWBOX,
} from '~/utils/bodyMap';
import { toggleInArray } from '~/utils/toggleInArray';

// Front + back body figures with clickable regions. v-model is the list of
// selected region ids (e.g. 'front_left_forearm') — tattoo locations.
const modelValue = defineModel<string[]>({ required: true });

const { t } = useI18n();

const figures = [
  { view: 'front', viewBox: FRONT_VIEWBOX, regions: FRONT_REGIONS },
  { view: 'back', viewBox: BACK_VIEWBOX, regions: BACK_REGIONS },
] as const;

const selectedSet = computed(() => new Set(modelValue.value));

const toggle = (id: string) => {
  modelValue.value = toggleInArray(modelValue.value, id);
};

// Compose an accessible label from the id, e.g. front_left_forearm → "Front · Left · Forearm".
const regionLabel = (id: string): string => {
  const tokens = id.split('_');
  const view = tokens.shift() as string;
  const parts = [t(`tattoo_view_${view}`)];
  if (tokens[0] === 'left' || tokens[0] === 'right') {
    parts.push(t(`tattoo_side_${tokens.shift()}`));
  }
  parts.push(t(`tattoo_part_${tokens.join('_')}`));
  return parts.join(' · ');
};
</script>

<style scoped lang="scss">
.body-map {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.figures {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.figure-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
}

.figure-svg {
  width: 150px;
  height: auto;
}

.region {
  cursor: pointer;
  outline: none;

  path {
    fill: color(--v-theme-on-surface, 0.05);
    stroke: color(--v-theme-on-surface, 0.35);
    stroke-width: 0.8;
    transition: fill 0.12s ease;
  }

  &:hover path {
    fill: color(--v-theme-accent, 0.4);
  }

  &.selected path {
    fill: color(--v-theme-accent);
    stroke: color(--v-theme-accent);
  }

  &:focus-visible path {
    stroke: color(--v-theme-accent);
    stroke-width: 1.5;
  }
}

.hint {
  font-size: 12px;
  text-align: center;
  opacity: 0.7;
}

@include mobile {
  // Keep front and back side by side — wrapping them costs a full screen height.
  .figures {
    gap: 10px;
  }

  .figure-svg {
    width: 110px;
  }
}
</style>
