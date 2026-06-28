<template>
  <div class="list-section">
    <div
      v-if="items.length"
      class="rows"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="row"
      >
        <span class="row-text">
          <slot
            name="item"
            :item="item"
            :index="index"
          />
        </span>
        <div class="row-actions">
          <Button
            variant="text"
            size="x-small"
            icon="mdi-pencil"
            :aria-label="$t('common_edit')"
            @click="emit('edit', index)"
          />
          <Button
            variant="text"
            size="x-small"
            color="error"
            icon="mdi-delete"
            :aria-label="$t('common_delete')"
            @click="emit('remove', index)"
          />
        </div>
      </div>
    </div>

    <Button
      variant="secondary"
      color="accent"
      block
      prepend-icon="mdi-plus"
      @click="emit('add')"
    >
      {{ addLabel }}
    </Button>
  </div>
</template>

<script lang="ts" setup generic="T">
import Button from '~/components/Button.vue';

/**
 * Added-items list + an "Add" button, used as the action inside a FieldCard for
 * Projects and Experience. Parent owns the array; this renders rows (via the
 * `item` slot) and emits add/edit/remove intent. The field title/explanation
 * live on the surrounding FieldCard, so this no longer renders its own title.
 */
defineProps<{
  items: T[];
  addLabel: string;
}>();

const emit = defineEmits<{
  add: [];
  edit: [index: number];
  remove: [index: number];
}>();
</script>

<style scoped lang="scss">
.list-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 12px;
}

.row-text {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  flex-shrink: 0;
}
</style>
