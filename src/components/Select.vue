<template>
  <div class="select-container">
    <label v-if="label" class="label" @click.stop>
      {{ label }}
      <span v-if="required" class="asterisk"> * </span>
    </label>
    <v-select
      class="select"
      v-bind="$attrs"
      variant="outlined"
      :color="color"
      :base-color="color"
      :disabled="disabled"
      :type="type"
      hide-details="auto"
      :multiple="multiple"
      :items="items"
      :density="density"
      :required="required"
      :error-messages="errorMessages"
      />
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  items: string[],
  multiple?: boolean,
  color?: string,
  disabled?: boolean,
  label?: string,
  type?: string,  
  density?: 'compact' | 'default' | 'comfortable',
  required?: boolean,
  errorMessages?: string | string[],
}>(), {
  multiple: false,
  color: 'primary',
  disabled: false,
  label: '',
  type: 'text',
  density: 'default',
  required: false,
  errorMessages: '',
})
</script>

<style scoped lang="scss">
.select-container {
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