<template>
  <div
    class="chip-picker"
    :class="{ 'is-light': light }"
  >
    <Input
      v-model="query"
      type="text"
      :color="light ? 'primary' : 'accent'"
      :placeholder="searchPlaceholder"
      prepend-inner-icon="mdi-magnify"
      hide-details
      density="compact"
    />

    <div
      class="groups"
      :style="maxHeight ? { maxHeight: `${maxHeight}px` } : undefined"
    >
      <p
        v-if="filtered.length === 0"
        class="no-results"
      >
        {{ $t('common_no_data_text') }}
      </p>

      <div
        v-for="group in filtered"
        :key="group.label"
        class="group"
      >
        <span class="group-label">{{ display(group.label) }}</span>

        <!-- Nested subgroups (e.g. camera brands). -->
        <template v-if="group.groups">
          <div
            v-for="sub in group.groups"
            :key="sub.label"
            class="subgroup"
          >
            <span class="subgroup-label">{{ display(sub.label) }}</span>
            <div class="chips">
              <v-chip
                v-for="item in sub.items"
                :key="item"
                v-bind="chipProps(item)"
                size="small"
                @click="toggle(item)"
              >
                {{ display(item) }}
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Direct leaf chips. -->
        <div
          v-if="group.items?.length"
          class="chips"
        >
          <v-chip
            v-for="item in group.items"
            :key="item"
            v-bind="chipProps(item)"
            size="small"
            @click="toggle(item)"
          >
            {{ display(item) }}
          </v-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ChipGroup } from '~/utils/gear';
import { toggleInArray } from '~/utils/toggleInArray';
import Input from '~/components/Input.vue';

// Searchable hierarchical multi-select; v-model is the flat selected array.
// Labels AND values run through `display()`, so literals and i18n keys both work.
const model = defineModel<string[]>({ required: true });

const props = withDefaults(
  defineProps<{
    groups: ChipGroup[];
    /** Already-translated placeholder for the search box. */
    searchPlaceholder?: string;
    /** Light-card variant (red titles, white chips) for the wizard. */
    light?: boolean;
    /** When set, the scroll region is capped at this px height. */
    maxHeight?: number;
  }>(),
  { searchPlaceholder: '', light: false, maxHeight: undefined },
);

const { t, te } = useI18n();

// Group labels and profession items are i18n keys; gear items are literals.
// Translate only when a key exists, so literals render (and match) as-is.
const display = (label: string): string => (te(label) ? t(label) : label);

const query = ref('');

const selected = computed(() => new Set(model.value));
const isSelected = (item: string) => selected.value.has(item);

const toggle = (item: string) => {
  model.value = toggleInArray(model.value, item);
};

const chipProps = (item: string) => {
  const sel = isSelected(item);
  // `chip-fill` keeps selected chips the same box size as unselected (see styles).
  if (props.light) {
    // Elevated so unselected chips stay visible against the white surface.
    return sel
      ? { variant: 'flat' as const, color: 'primary', class: 'chip-fill' }
      : { variant: 'elevated' as const, color: 'white' };
  }
  // Dark popups use accent (primary is reserved for icons there).
  return sel
    ? { variant: 'flat' as const, color: 'accent', class: 'chip-fill' }
    : { variant: 'outlined' as const, color: undefined };
};

const norm = (s: string) => s.toLowerCase().trim();

// Recursively filter a group against the query. `ancestorMatched` short-circuits
// to "keep everything below" once a label on the path matched.
const filterGroup = (
  group: ChipGroup,
  q: string,
  ancestorMatched: boolean,
): ChipGroup | null => {
  const labelMatched = ancestorMatched || norm(display(group.label)).includes(q);

  const subgroups = group.groups
    ?.map(g => filterGroup(g, q, labelMatched))
    .filter((g): g is ChipGroup => g !== null);

  const items = labelMatched
    ? group.items
    : group.items?.filter(i => norm(display(i)).includes(q));

  const hasSub = !!subgroups && subgroups.length > 0;
  const hasItems = !!items && items.length > 0;
  if (!hasSub && !hasItems) return null;

  return {
    label: group.label,
    ...(hasSub ? { groups: subgroups } : {}),
    ...(hasItems ? { items } : {}),
  };
};

const filtered = computed<ChipGroup[]>(() => {
  const q = norm(query.value);
  if (!q) return props.groups;
  return props.groups
    .map(g => filterGroup(g, q, false))
    .filter((g): g is ChipGroup => g !== null);
});
</script>

<style scoped lang="scss">
.chip-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
}

.no-results {
  font-size: 14px;
  opacity: 0.6;
  text-align: center;
  margin: 0;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

// Dark popups: accent section titles (primary is reserved for icons).
.group-label {
  font-size: 15px;
  font-weight: 600;
  color: color(--v-theme-accent);
}

.subgroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 4px;
  margin-top: 4px;
}

.subgroup-label {
  font-size: 13px;
  font-weight: 500;
  color: color(--v-theme-accent);
  opacity: 0.85;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

// Keep filled (selected) chips the same size as the outlined/elevated unselected
// ones — without this border the chip visibly shrinks on select.
.chips :deep(.v-chip.chip-fill) {
  border: thin solid transparent;
}

// Light-card variant (registration wizard): red category/brand titles.
.is-light {
  .group-label {
    color: color(--v-theme-primary);
  }

  .subgroup-label {
    color: color(--v-theme-primary);
  }
}
</style>
