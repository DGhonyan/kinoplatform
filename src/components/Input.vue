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
      :base-color="color"
      :disabled="disabled"
      :type="type"
      hide-details="auto"
      :density="density"
      :required="required"
      :error-messages="errorMessages"
      @update:model-value="updateModelValue"
    />
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  color?: string,
  disabled?: boolean,
  label?: string,
  type?: string,
  density?: 'compact' | 'default' | 'comfortable',
  required?: boolean,
  errorMessages?: string | string[],
}>(), {
  color: 'primary',
  disabled: false,
  label: '',
  type: 'textarea',
  density: 'default',
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

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