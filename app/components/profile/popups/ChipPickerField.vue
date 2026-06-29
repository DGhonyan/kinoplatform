<template>
  <div class="chip-picker-field">
    <label
      v-if="label"
      class="field-label"
      @click.stop="dialogOpen = true"
    >
      {{ $t(label) }}
    </label>

    <!-- Closed trigger: looks like a select field, opens the picker popup. A div
         (not a button) because it contains closable chips, which are themselves
         interactive — nested buttons are invalid. -->
    <div
      class="trigger"
      :class="{ 'has-error': !!error, 'is-light': light }"
      role="button"
      tabindex="0"
      @click="dialogOpen = true"
      @keydown.enter.prevent="dialogOpen = true"
      @keydown.space.prevent="dialogOpen = true"
    >
      <div class="trigger-content">
        <span
          v-if="model.length === 0"
          class="placeholder"
        >
          {{ placeholder }}
        </span>
        <div
          v-else
          class="trigger-chips"
        >
          <v-chip
            v-for="item in visibleChips"
            :key="item"
            size="small"
            variant="flat"
            :color="light ? 'primary' : 'accent'"
            closable
            class="trigger-chip"
            @click.stop
            @click:close.stop="remove(item)"
          >
            {{ display(item) }}
          </v-chip>
          <span
            v-if="overflowCount > 0"
            class="trigger-overflow"
          >
            +{{ overflowCount }}
          </span>
        </div>
      </div>
      <v-icon class="chevron">
        mdi-chevron-right
      </v-icon>
    </div>

    <p
      v-if="error"
      class="field-error"
    >
      {{ error }}
    </p>

    <PopupShell
      v-model="dialogOpen"
      :title="title"
      :theme="light ? 'light' : ''"
    >
      <ChipPicker
        v-model="model"
        :groups="groups"
        :light="light"
        :search-placeholder="searchPlaceholder"
        :max-height="420"
      />

      <template #actions>
        <Button
          size="large"
          @click="dialogOpen = false"
        >
          {{ $t('common_done') }}
        </Button>
      </template>
    </PopupShell>
  </div>
</template>

<script lang="ts" setup>
import type { ChipGroup } from '~/utils/gear';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import ChipPicker from '~/components/profile/popups/ChipPicker.vue';
import Button from '~/components/Button.vue';

/**
 * A closed, select-like field (selected chips + a chevron) that opens the
 * hierarchical ChipPicker in a popup — the in-wizard equivalent of the gear
 * popup's secondary chip-picker view. v-model is the flat selected array.
 */
const model = defineModel<string[]>({ required: true });

const props = withDefaults(
  defineProps<{
    groups: ChipGroup[];
    /** Popup title. */
    title: string;
    /** i18n key for the field label rendered above the trigger. */
    label?: string;
    /** Placeholder shown in the trigger when nothing is selected. */
    placeholder?: string;
    searchPlaceholder?: string;
    light?: boolean;
    /** Already-translated field error. */
    error?: string;
    /** How many chips to show in the trigger before collapsing the rest to "+N". */
    maxVisibleChips?: number;
  }>(),
  {
    label: '',
    placeholder: '',
    searchPlaceholder: '',
    light: false,
    error: '',
    maxVisibleChips: 2,
  },
);

const { t, te } = useI18n();

// Selected values may be i18n keys (professions) or literals (gear) — translate
// only when a key exists.
const display = (value: string): string => (te(value) ? t(value) : value);

// Cap the chips shown in the trigger so a big selection can't grow it and shift
// the layout; the rest collapse into a "+N" badge (manage them in the popup).
const visibleChips = computed(() => model.value.slice(0, props.maxVisibleChips));
const overflowCount = computed(() =>
  Math.max(0, model.value.length - props.maxVisibleChips),
);

const dialogOpen = ref(false);

const remove = (item: string) => {
  model.value = model.value.filter(i => i !== item);
};
</script>

<style scoped lang="scss">
.chip-picker-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 56px;
  padding: 8px 12px 8px 16px;
  border: 1px solid color(--v-theme-on-surface, 0.38);
  border-radius: 16px;
  // Dark popups: transparent fill to match the sibling Input/Select fields.
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease;

  // Light card (registration wizard): white-ish accent field.
  &.is-light {
    background: color(--v-theme-accent);
  }

  &:hover {
    border-color: color(--v-theme-on-surface, 0.6);
  }

  &.has-error {
    border-color: color(--v-theme-error);
  }
}

.trigger-content {
  flex: 1;
  min-width: 0;
}

.placeholder {
  font-size: 15px;
  opacity: 0.6;
}

.trigger-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

// Keep a single chip from blowing out the row; long labels ellipsize.
.trigger-chip {
  max-width: 130px;

  :deep(.v-chip__content) {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.trigger-overflow {
  font-size: 13px;
  white-space: nowrap;
  opacity: 0.7;
}

.chevron {
  flex-shrink: 0;
  opacity: 0.6;
}

.field-error {
  font-size: 12px;
  color: color(--v-theme-error);
  padding-left: 16px;
}
</style>
