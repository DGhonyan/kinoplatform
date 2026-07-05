<template>
  <div class="swatch-group">
    <label class="swatch-label">
      {{ $t(label) }}
      <span
        v-if="required"
        class="req"
      >*</span>
    </label>

    <div class="swatches">
      <button
        v-for="hex in colors"
        :key="hex"
        type="button"
        class="swatch"
        :class="{ selected: modelValue === hex }"
        :style="{ background: hex }"
        :aria-label="hex"
        :title="hex"
        @click="select(hex)"
      >
        <v-icon
          v-if="modelValue === hex"
          :color="isLightColor(hex) ? '#1D1D1D' : '#FFFFFF'"
          size="26"
        >
          mdi-check
        </v-icon>
      </button>

      <!-- Custom color (hair only): the picked swatch, then the add circle. -->
      <template v-if="custom">
        <button
          v-if="customHex"
          type="button"
          class="swatch"
          :class="{ selected: modelValue === customHex }"
          :style="{ background: customHex }"
          :aria-label="customHex"
          :title="customHex"
          @click="select(customHex)"
        >
          <v-icon
            v-if="modelValue === customHex"
            :color="isLightColor(customHex) ? '#1D1D1D' : '#FFFFFF'"
            size="26"
          >
            mdi-check
          </v-icon>
        </button>

        <button
          type="button"
          class="swatch add"
          :aria-label="$t('appearance_add_custom_color')"
          :title="$t('appearance_add_custom_color')"
          @click="openPicker"
        >
          <v-icon size="26">
            mdi-plus
          </v-icon>
        </button>
        <input
          ref="nativeInput"
          type="color"
          class="native-color"
          :value="customHex || '#888888'"
          @change="onPicked"
        >
      </template>
    </div>

    <span
      v-if="error"
      class="swatch-error"
    >{{ error }}</span>
  </div>
</template>

<script lang="ts" setup>
import { isLightColor } from '~/utils/appearance';

/**
 * A grid of selectable 70×70 color circles. The stored value is the hex string
 * itself. With `custom`, an extra add-circle opens the native color picker and
 * the chosen hex is kept as its own selectable swatch (used for hair).
 */
const modelValue = defineModel<string>({ required: true });

const props = withDefaults(defineProps<{
  colors: readonly string[];
  label: string;
  required?: boolean;
  custom?: boolean;
  error?: string;
}>(), {
  required: false,
  custom: false,
  error: '',
});

const nativeInput = ref<HTMLInputElement | null>(null);
// A custom (non-preset) selection stays visible as its own swatch.
const customHex = ref(
  modelValue.value && !props.colors.includes(modelValue.value) ? modelValue.value : '',
);

const select = (hex: string) => {
  modelValue.value = hex;
};

const openPicker = () => nativeInput.value?.click();

const onPicked = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  customHex.value = value;
  modelValue.value = value;
};
</script>

<style scoped lang="scss">
.swatch-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.swatch-label {
  font-size: 14px;
  font-weight: 500;
}

.req {
  color: color(--v-theme-error);
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 1px solid color(--v-theme-on-surface, 0.15);
  cursor: pointer;
  transition: box-shadow 0.12s ease, transform 0.12s ease;

  &:hover {
    transform: scale(1.05);
  }

  // Double ring — a surface-colored gap, then the accent halo.
  &.selected {
    box-shadow:
      0 0 0 3px color(--v-theme-surface),
      0 0 0 6px color(--v-theme-accent);
  }
}

.swatch.add {
  border: 1px dashed color(--v-theme-on-surface, 0.4);
  color: color(--v-theme-accent);
  background: color(--v-theme-on-surface, 0.03);

  &:hover {
    border-color: color(--v-theme-accent);
  }
}

.native-color {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.swatch-error {
  font-size: 12px;
  color: color(--v-theme-error);
}
</style>
