<template>
  <div class="shared-input">
    <label v-if="label" class="label" @click.stop>
      {{ label }}
  
      <span v-if="required" class="asterisk"> * </span>
    </label>
  
    <v-text-field
      class="input"
      v-bind="$attrs"
      variant="outlined"
      :color="color"
      :base-color="required ? 'primary' : color"
      :disabled="disabled"
      :type="actualType"
      hide-details="auto"
      :density="density"
      :required="required"
      :error-messages="errorMessages"
      :append-inner-icon="isPassword ? (showPassword ? 'mdi-eye-off' : 'mdi-eye') : undefined"
      @click:append-inner="togglePasswordVisibility"
      @update:model-value="updateModelValue"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
  color?: string,
  disabled?: boolean,
  label?: string,
  type?: string,
  density?: 'compact' | 'default' | 'comfortable',
  required?: boolean,
  errorMessages?: string | string[],
}>(), {
  color: 'grey',
  disabled: false,
  label: '',
  type: 'textarea',
  density: 'default',
  required: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const showPassword = ref(false);

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

:deep(.v-input__details) {
  padding: 0 !important;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: color(--v-theme-gray);
}

.asterisk {
  color: color(--v-theme-error);
}
</style>