<template>
  <div class="text-area-container">
    <label
      v-if="label"
      class="label"
      @click.stop
    >
      {{ $t(label) }}

      <span
        v-if="required"
        class="asterisk"
      > * </span>
    </label>
    <v-textarea
      class="text-area"
      v-bind="$attrs"
      :color="resolvedColor"
      :base-color="resolvedBaseColor"
      :disabled="disabled"
      :type="type"
      :required="required"
      :error-messages="errorMessages"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  color?: string;
  /** Resting-state outline. Grey like Input's — `color` only paints focus. */
  baseColor?: string;
  disabled?: boolean;
  label?: string;
  type?: string;
  required?: boolean;
  errorMessages?: string | string[];
}>(), {
  color: 'primary',
  baseColor: 'grey',
  disabled: false,
  label: '',
  type: 'textarea',
  required: false,
  errorMessages: '',
});

// Let callers pass theme tokens (incl. `on-*`) by name; resolveThemeColor turns
// the ones Vuetify can't (the `on-*` ones) into the working variable form.
const resolvedColor = computed(() => resolveThemeColor(props.color));
// Previously the base colour was `color` itself — primary is #810100, so every
// idle textarea wore a near-invisible dark-red outline on the dark surface.
const resolvedBaseColor = computed(() => resolveThemeColor(props.baseColor));
</script>

<style scoped lang="scss">
.text-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.v-input__details) {
  padding: 0 !important;
}

.label {
  font-size: 14px;
  font-weight: 500;
}

.asterisk {
  color: color(--v-theme-error);
}
</style>
