<template>
  <div class="select-container">
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

    <v-autocomplete
      ref="selectRef"
      autocomplete="suppress"
      class="select"
      v-bind="$attrs"
      :color="resolvedColor"
      base-color="grey"
      :disabled="disabled"
      :type="type"
      :menu-props="{ contentClass: 'select-menu-content', width: menuWidth }"
      :multiple="multiple"
      :items="items"
      :density="density"
      :required="required"
      :error-messages="errorMessages"
      :no-data-text="noDataText"
      :custom-filter="customFilter"
    >
      <!-- Multi-select only: cap visible chips so a big selection can't grow the
           trigger and shift the page. Singles keep Vuetify's default rendering. -->
      <template
        v-if="multiple"
        #selection="{ item, index }"
      >
        <v-chip
          v-if="index < maxVisibleChips"
          size="small"
          closable
          class="select-chip"
          @click:close="removeAt(index)"
        >
          {{ item.title }}
        </v-chip>
        <span
          v-else-if="index === maxVisibleChips"
          class="select-overflow"
        >
          +{{ selectedCount - maxVisibleChips }}
        </span>
      </template>
    </v-autocomplete>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  items: { title: string; value: string }[] | string[];
  multiple?: boolean;
  color?: string;
  disabled?: boolean;
  label?: string;
  type?: string;
  density?: 'compact' | 'default' | 'comfortable';
  required?: boolean;
  errorMessages?: string | string[];
  noDataText?: string;
  /** Multi-select: how many chips to show before collapsing the rest into "+N". */
  maxVisibleChips?: number;
  /** Explicit passthrough for v-autocomplete's custom-filter (e.g. fuzzy/code search). */
  customFilter?: (
    itemTitle: string,
    query: string,
    item?: { raw: { value: string } },
  ) => boolean;
}>(), {
  multiple: false,
  color: 'primary',
  disabled: false,
  label: '',
  type: 'text',
  density: 'default',
  required: false,
  errorMessages: '',
  noDataText: 'common_no_data_text',
  maxVisibleChips: 2,
});

// Let callers pass theme tokens (incl. `on-*`) by name; resolveThemeColor turns
// the ones Vuetify can't (the `on-*` ones) into the working variable form.
const resolvedColor = computed(() => resolveThemeColor(props.color));

// v-model rides through $attrs (we don't declare it as a prop). For the capped
// chip view we need to read it (overflow count) and write it (chip removal).
const attrs = useAttrs();
const selectedCount = computed(() =>
  Array.isArray(attrs.modelValue) ? attrs.modelValue.length : 0,
);
const removeAt = (index: number) => {
  if (!Array.isArray(attrs.modelValue)) return;
  const next = [...attrs.modelValue];
  next.splice(index, 1);
  // v-model plus an extra @update:model-value get merged into an array of
  // handlers, so normalize to an array and call each.
  const handler = attrs['onUpdate:modelValue'];
  const handlers = Array.isArray(handler) ? handler : [handler];
  for (const fn of handlers) {
    if (typeof fn === 'function') fn(next);
  }
};

// Pin the dropdown to the field's width so its size doesn't track the option
// text (the menu is shrink-to-fit, so wrapping alone won't stop it growing).
// We feed the measured field width to the menu; wrapping then keeps long labels
// inside that width. ResizeObserver keeps them in sync as the layout changes.
const selectRef = ref();
const menuWidth = ref<number>();
let observer: ResizeObserver | undefined;

onMounted(() => {
  const el = selectRef.value?.$el as HTMLElement | undefined;
  if (!el) return;
  observer = new ResizeObserver(() => {
    menuWidth.value = el.offsetWidth;
  });
  observer.observe(el);
});

onBeforeUnmount(() => observer?.disconnect());
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
}

.asterisk {
  color: color(--v-theme-error);
}

// Keep a single chip from blowing out the row; long labels ellipsize.
.select-chip {
  max-width: 130px;

  :deep(.v-chip__content) {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.select-overflow {
  align-self: center;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0.7;
}
</style>

<!-- Not scoped: the dropdown is teleported to the overlay container, outside
     this component's DOM, so scoped styles can't reach it. Keyed to the menu's
     contentClass so only this component's dropdown is affected. Lets long option
     labels wrap to the menu width instead of widening the menu. -->
<style lang="scss">
.select-menu-content {
  .v-list-item-title {
    white-space: normal;
    overflow-wrap: anywhere;
  }
}
</style>
