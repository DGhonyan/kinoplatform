<template>
  <div class="swatch-multi">
    <span class="swatch-label">{{ $t(label) }}</span>
    <div class="swatches">
      <button
        v-for="hex in colors"
        :key="hex"
        type="button"
        class="swatch"
        :class="{ selected: modelValue.includes(hex) }"
        :style="{ background: hex }"
        :aria-label="hex"
        :title="hex"
        @click="toggle(hex)"
      >
        <v-icon
          v-if="modelValue.includes(hex)"
          :color="isLightColor(hex) ? '#1D1D1D' : '#FFFFFF'"
          size="18"
        >
          mdi-check
        </v-icon>
      </button>

      <!-- "Other" bucket — matches any custom (non-preset) color. -->
      <button
        v-if="otherLabel"
        type="button"
        class="swatch other"
        :class="{ selected: modelValue.includes(OTHER) }"
        :title="$t(otherLabel)"
        :aria-label="$t(otherLabel)"
        @click="toggle(OTHER)"
      >
        <v-icon
          v-if="modelValue.includes(OTHER)"
          color="#FFFFFF"
          size="18"
        >
          mdi-check
        </v-icon>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isLightColor } from '~/utils/appearance';
import { toggleInArray } from '~/utils/toggleInArray';

/**
 * Multi-select color swatches for filters (v-model is a hex array). Shares the
 * swatch look with the single-select ColorSwatchGroup, but toggles membership.
 */
const modelValue = defineModel<string[]>({ required: true });

defineProps<{
  colors: readonly string[];
  label: string;
  /** When set, render an "Other" swatch (this i18n key) that matches custom colors. */
  otherLabel?: string;
}>();

// Sentinel the backend understands as "any custom (non-preset) color".
const OTHER = '__other__';

const toggle = (hex: string) => {
  modelValue.value = toggleInArray(modelValue.value, hex);
};
</script>

<style scoped lang="scss">
.swatch-multi {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.swatch-label {
  font-size: 13px;
  font-weight: 500;
  color: color(--v-theme-on-surface, 0.7);
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid color(--v-theme-on-surface, 0.15);
  cursor: pointer;
  transition: box-shadow 0.12s ease, transform 0.12s ease;

  &:hover {
    transform: scale(1.08);
  }

  &.selected {
    box-shadow:
      0 0 0 2px color(--v-theme-surface),
      0 0 0 4px color(--v-theme-primary);
  }
}

// "Other" reads as "any color" — a rainbow wheel.
.swatch.other {
  background: conic-gradient(
    #d01821,
    #d9943b,
    #937d58,
    #276b1c,
    #2b26b9,
    #8827a6,
    #d92c96,
    #d01821
  );
}
</style>
