<template>
  <div class="text-area-container">
    <label v-if="label" class="label" @click.stop>
      {{ label }}
  
      <span v-if="required" class="asterisk"> * </span>
    </label>
    <v-textarea
      class="text-area"
      v-bind="$attrs"
      variant="outlined"
      :color="color"
      :base-color="color"
      :disabled="disabled"
      :type="type"
      hide-details="auto"
      :required="required"
      :error-messages="errorMessages"
    />
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  color?: string,
  disabled?: boolean,
  label?: string,
  type?: string,
  required?: boolean,
  errorMessages?: string | string[],
}>(), {
  color: 'primary',
  disabled: false,
  label: '',
  type: 'textarea',
  required: false,
  errorMessages: '',
})
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
  color: color(--v-theme-gray);
}

.asterisk {
  color: color(--v-theme-error);
}
</style>