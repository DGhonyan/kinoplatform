<template>
  <div class="chip-group">
    <div class="chip-label-row">
      <span class="chip-label">{{ label }}</span>
      <Button
        v-if="editable"
        icon="mdi-pencil"
        variant="text"
        size="x-small"
        :aria-label="$t('common_edit')"
        @click="emit('edit')"
      />
    </div>

    <div
      v-if="items.length"
      class="chips"
    >
      <v-chip
        v-for="item in items"
        :key="item"
        size="small"
        color="accent"
        variant="outlined"
      >
        {{ item }}
      </v-chip>
    </div>

    <!-- Empty + owner: an entry point to add the first items (e.g. gear). -->
    <Button
      v-else-if="addLabel"
      variant="text"
      size="small"
      prepend-icon="mdi-plus"
      color="accent"
      class="chip-add"
      @click="emit('add')"
    >
      {{ addLabel }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
import Button from '~/components/Button.vue';

/**
 * A labelled row of outlined chips used across the profile (languages, gear,
 * practicalities). Optionally shows an edit pencil (`editable`) and, when the
 * list is empty, an "add" call-to-action (`addLabel`) — for owner-editable
 * sections that should still offer an entry point with nothing filled in yet.
 */
defineProps<{
  label: string;
  items: string[];
  editable?: boolean;
  addLabel?: string;
}>();

const emit = defineEmits<{
  edit: [];
  add: [];
}>();
</script>

<style scoped lang="scss">
.chip-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chip-label-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chip-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-add {
  align-self: flex-start;
}
</style>
