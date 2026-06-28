<template>
  <div
    class="shared-input"
    :class="{ 'has-text-color': textColor }"
  >
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

    <v-text-field
      class="input"
      v-bind="$attrs"
      :color="resolvedColor"
      :base-color="resolvedBaseColor"
      :bg-color="resolvedBgColor"
      :disabled="disabled"
      :type="actualType"
      :density="density"
      :required="required"
      :error-messages="errorMessages"
      :hide-details="hideDetails"
      :append-inner-icon="isPassword ? (showPassword ? 'mdi-eye-off' : 'mdi-eye') : undefined"
      :hint="hint"
      :persistent-hint="persistentHint"
      @click:append-inner="togglePasswordVisibility"
      @update:model-value="updateModelValue"
    >
      <!-- Forward every named slot we receive (prepend-inner, append-inner,
           prepend, append, message, etc.) straight through to v-text-field. -->
      <template
        v-for="(_, name) in $slots"
        :key="name"
        #[name]="slotData"
      >
        <slot
          :name="name"
          v-bind="slotData ?? {}"
        />
      </template>
    </v-text-field>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
  color?: string;
  baseColor?: string;
  /** Field background. Any CSS color or theme token, e.g. `rgb(var(--v-theme-on-surface))`. Unset = transparent (outlined default). */
  bgColor?: string;
  disabled?: boolean;
  label?: string;
  type?: string;
  density?: 'compact' | 'default' | 'comfortable';
  required?: boolean;
  errorMessages?: string | string[];
  textPosition?: 'left' | 'center' | 'right';
  hideDetails?: boolean | 'auto';
  persistentHint?: boolean;
  hint?: string;
  /**
   * Color of the typed text, placeholder, and inner icons. A theme token
   * (`background`, `on-surface`, …) or any CSS color. Use this instead of
   * :deep(input) overrides at the call site (placeholder/icons get a softer
   * opacity automatically).
   */
  textColor?: string;
}>(), {
  color: 'primary',
  baseColor: 'grey',
  disabled: false,
  label: '',
  type: 'textarea',
  density: 'default',
  required: false,
  textPosition: 'left',
  hint: '',
  hideDetails: true,
  persistentHint: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Let callers pass theme tokens (incl. `on-*`) by name; resolveThemeColor turns
// the ones Vuetify can't (the `on-*` ones) into the working variable form.
const resolvedColor = computed(() => resolveThemeColor(props.color));
const resolvedBaseColor = computed(() => resolveThemeColor(props.baseColor));
const resolvedBgColor = computed(() => resolveThemeColor(props.bgColor));
const resolvedTextColor = computed(() => themeColorToCss(props.textColor) ?? '');

const showPassword = ref(false);
const textPosition = computed(() => props.textPosition);
const isPassword = computed(() => props.type === 'password');

const actualType = computed(() => {
  if (isPassword.value && showPassword.value) {
    return 'text';
  }
  return props.type;
});

const togglePasswordVisibility = () => {
  if (isPassword.value) {
    showPassword.value = !showPassword.value;
  }
};

const updateModelValue = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<style scoped lang="scss">
.shared-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input :deep(input) {
  text-align: v-bind(textPosition);
}

:deep(.v-input__details) {
  padding: 0 !important;
}

// Opt-in text/placeholder/icon color, driven by the `text-color` prop. Lives
// here so call sites don't have to reach into Vuetify internals with :deep.
.has-text-color :deep(input) {
  color: v-bind(resolvedTextColor);
}

.has-text-color :deep(input::placeholder) {
  color: v-bind(resolvedTextColor);
  opacity: 0.6;
}

.has-text-color :deep(.v-field__prepend-inner),
.has-text-color :deep(.v-field__append-inner) {
  color: v-bind(resolvedTextColor);
  opacity: 0.7;
}

.label {
  font-size: 14px;
  font-weight: 500;
}

.asterisk {
  color: color(--v-theme-error);
}
</style>
