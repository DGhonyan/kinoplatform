<template>
  <!-- One form: Enter from any field runs the search; submit buttons disable while
       a range is invalid, so the action is never silently dead. -->
  <form
    class="talents"
    @submit.prevent="applyFilters"
  >
    <!-- The search row comes FIRST in the DOM. Stacked (below 960px) it is also
         visually first, so keyboard and screen-reader users reach it immediately
         instead of tabbing through fifteen filter controls to get to the box that
         looks first. Desktop puts it back in the right-hand column via grid
         areas — placement, not `order`, so the two orders can never diverge. -->
    <div class="toolbar">
      <Input
        v-model="q"
        class="search"
        :placeholder="$t('talent_search_placeholder')"
        prepend-inner-icon="mdi-magnify"
        maxlength="100"
        bg-color="on-surface"
        color="background"
        text-color="background"
        rounded="pill"
        density="comfortable"
        hide-details
      />
      <Button
        type="submit"
        class="search-btn"
        color="primary"
        prepend-icon="mdi-magnify"
        :loading="loading"
        :disabled="hasRangeErrors"
      >
        {{ $t('common_search') }}
      </Button>
    </div>

    <div class="filters">
      <div class="filters-scroll">
        <div class="filters-header">
          <v-icon>custom:filter</v-icon>
          <h2
            :id="titleId"
            class="filters-title"
          >
            {{ $t('crew_filters') }}
          </h2>
          <!-- CSS shows this only below tablet, where the panel stacks above the
               results; `display: none` keeps it out of the desktop tab order. -->
          <button
            type="button"
            class="filters-toggle"
            :aria-expanded="filtersOpen"
            :aria-controls="bodyId"
            :aria-labelledby="titleId"
            @click="filtersOpen = !filtersOpen"
          >
            <v-icon
              class="filters-chevron"
              :class="{ 'is-open': filtersOpen }"
            >
              mdi-chevron-down
            </v-icon>
          </button>
        </div>

        <div
          :id="bodyId"
          class="filters-body"
          :class="{ 'is-open': filtersOpen }"
        >
          <!-- The section header is the facet's only visible name, so each
               control gets an aria-label instead of its own visible label. -->
          <FilterSection title="crew_filter_profession">
            <Select
              v-model="professions"
              :items="professionItems"
              :aria-label="$t('crew_filter_profession')"
              multiple
            />
          </FilterSection>

          <FilterSection title="crew_filter_location">
            <Select
              v-model="locations"
              :items="locationOptions"
              :aria-label="$t('crew_filter_location')"
              multiple
            />
          </FilterSection>

          <FilterSection title="register_education_label">
            <Select
              v-model="educations"
              :items="educationOptions"
              :aria-label="$t('register_education_label')"
              multiple
            />
          </FilterSection>

          <FilterSection title="crew_filter_languages">
            <Select
              v-model="languages"
              :items="languageItems"
              :aria-label="$t('crew_filter_languages')"
              multiple
            />
          </FilterSection>

          <FilterSection title="register_gender_label">
            <Select
              v-model="genders"
              :items="genderItems"
              :aria-label="$t('register_gender_label')"
              multiple
            />
          </FilterSection>

          <!-- Min and Max sit under one header, so the header alone would give
               both fields the same name — rangeLabel() keeps them apart. -->
          <FilterSection title="talent_filter_age">
            <div class="range-row">
              <Input
                v-model="minAge"
                type="number"
                :min="AGE_RANGE.min"
                :max="AGE_RANGE.max"
                step="1"
                :placeholder="$t('talent_filter_min')"
                :aria-label="rangeLabel('talent_filter_age', 'talent_filter_min')"
                :error-messages="rangeErrors.minAge"
                hide-details="auto"
                density="compact"
              />
              <Input
                v-model="maxAge"
                type="number"
                :min="AGE_RANGE.min"
                :max="AGE_RANGE.max"
                step="1"
                :placeholder="$t('talent_filter_max')"
                :aria-label="rangeLabel('talent_filter_age', 'talent_filter_max')"
                :error-messages="rangeErrors.maxAge"
                hide-details="auto"
                density="compact"
              />
            </div>
          </FilterSection>

          <FilterSection title="appearance_height">
            <div class="range-row">
              <Input
                v-model="minHeight"
                type="number"
                :min="HEIGHT_RANGE.min"
                :max="HEIGHT_RANGE.max"
                step="1"
                :placeholder="$t('talent_filter_min')"
                :aria-label="rangeLabel('appearance_height', 'talent_filter_min')"
                :error-messages="rangeErrors.minHeight"
                hide-details="auto"
                density="compact"
              />
              <Input
                v-model="maxHeight"
                type="number"
                :min="HEIGHT_RANGE.min"
                :max="HEIGHT_RANGE.max"
                step="1"
                :placeholder="$t('talent_filter_max')"
                :aria-label="rangeLabel('appearance_height', 'talent_filter_max')"
                :error-messages="rangeErrors.maxHeight"
                hide-details="auto"
                density="compact"
              />
            </div>
          </FilterSection>

          <FilterSection title="appearance_weight">
            <div class="range-row">
              <Input
                v-model="minWeight"
                type="number"
                :min="WEIGHT_RANGE.min"
                :max="WEIGHT_RANGE.max"
                step="1"
                :placeholder="$t('talent_filter_min')"
                :aria-label="rangeLabel('appearance_weight', 'talent_filter_min')"
                :error-messages="rangeErrors.minWeight"
                hide-details="auto"
                density="compact"
              />
              <Input
                v-model="maxWeight"
                type="number"
                :min="WEIGHT_RANGE.min"
                :max="WEIGHT_RANGE.max"
                step="1"
                :placeholder="$t('talent_filter_max')"
                :aria-label="rangeLabel('appearance_weight', 'talent_filter_max')"
                :error-messages="rangeErrors.maxWeight"
                hide-details="auto"
                density="compact"
              />
            </div>
          </FilterSection>

          <!-- The colour facets drop `label` (now optional): the section header
               already names the group, and each swatch carries its own
               aria-label, so a second copy would just render the name twice. -->
          <FilterSection title="appearance_hair_color">
            <ColorMultiSelect
              v-model="hairColors"
              :colors="HAIR_COLORS"
              other-label="talent_filter_other"
            />
          </FilterSection>

          <FilterSection title="appearance_eye_color">
            <ColorMultiSelect
              v-model="eyeColors"
              :colors="EYE_COLORS"
            />
          </FilterSection>

          <FilterSection title="appearance_skin_color">
            <ColorMultiSelect
              v-model="skinColors"
              :colors="SKIN_COLORS"
            />
          </FilterSection>
        </div>
      </div>

      <!-- Pinned so the actions are always reachable without scrolling the panel. -->
      <div class="filters-footer">
        <span
          v-if="hasRangeErrors"
          class="footer-error"
        >{{ $t('talent_filter_fix_ranges') }}</span>
        <div class="footer-actions">
          <Button
            v-if="hasActiveFilters"
            color="white"
            text-color="primary"
            @click="clearFilters"
          >
            {{ $t('crew_filter_clear_all') }}
          </Button>
          <Button
            type="submit"
            class="apply-btn"
            color="primary"
            :loading="loading"
            :disabled="hasRangeErrors"
          >
            {{ $t('talent_filter_apply') }}
          </Button>
        </div>
      </div>
    </div>

    <div
      v-if="results.length > 0"
      class="user-grid"
    >
      <UserCard
        v-for="user in results"
        :key="user._id"
        :user="user"
      />
    </div>

    <div
      v-else
      class="no-results"
    >
      <span>{{ $t('talent_no_talents_found') }}</span>
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { User, TalentSearchFilters } from '~~/shared/types/user';
import { TALENT_PROFESSIONS, GENDERS } from '~/utils/constants';
import {
  HAIR_COLORS,
  EYE_COLORS,
  SKIN_COLORS,
  HEIGHT_RANGE,
  WEIGHT_RANGE,
} from '~/utils/appearance';
import { LANGUAGE_CODES, getLanguageDisplayName } from '~/utils/languages';
import Select from '~/components/Select.vue';
import ColorMultiSelect from '~/components/ColorMultiSelect.vue';
import FilterSection from '~/components/FilterSection.vue';

definePageMeta({
  header: { cover: true, slogan: 'talent_page_slogan', coverNav: false },
});

const { t, locale } = useI18n();
const userStore = useUserStore();

const results = ref<User[]>([]);
const loading = ref(false);
const locationOptions = ref<string[]>([]);
const educationOptions = ref<string[]>([]);

// ── Filter state ──
const q = ref('');
const professions = ref<string[]>([]);
const locations = ref<string[]>([]);
const educations = ref<string[]>([]);
const languages = ref<string[]>([]);
const genders = ref<string[]>([]);
const minAge = ref('');
const maxAge = ref('');
const minHeight = ref('');
const maxHeight = ref('');
const minWeight = ref('');
const maxWeight = ref('');
const hairColors = ref<string[]>([]);
const eyeColors = ref<string[]>([]);
const skinColors = ref<string[]>([]);

// ── Stacked panel (below 960px) ──
// The sidebar turns into a full-width block above the results, collapsed by
// default so the grid stays one scroll away. The layout switch is pure CSS; this
// state only drives the panel's own collapse. Above 960px the toggle is
// `display: none` and the body never gets the collapsed rule, so it's inert
// there. Each facet owns its own open/closed state inside FilterSection.
const filtersOpen = ref(false);
const titleId = useId();
const bodyId = useId();

// Numeric filter bounds — mirror the backend TalentSearchDto (integers, in range).
const AGE_RANGE = { min: 0, max: 120 };

// Min and Max share a FilterSection header, so each field needs a name that
// distinguishes it. Composed from keys we already ship (facet first, matching
// the visual order) rather than adding six near-duplicate ones.
const rangeLabel = (facetKey: string, boundKey: string) => `${t(facetKey)} ${t(boundKey)}`;

const rangeFieldError = (value: string, bound: { min: number; max: number }): string => {
  if (value === '') return '';
  const n = Number(value);
  if (!Number.isInteger(n) || n < bound.min || n > bound.max) {
    return t('talent_filter_range_error', { min: bound.min, max: bound.max });
  }
  return '';
};

// Live validation — errors surface inline as the user types (not on submit), and
// gate the submit buttons, so a bad range is obvious rather than silently blocking.
const rangeErrors = computed(() => ({
  minAge: rangeFieldError(minAge.value, AGE_RANGE),
  maxAge: rangeFieldError(maxAge.value, AGE_RANGE),
  minHeight: rangeFieldError(minHeight.value, HEIGHT_RANGE),
  maxHeight: rangeFieldError(maxHeight.value, HEIGHT_RANGE),
  minWeight: rangeFieldError(minWeight.value, WEIGHT_RANGE),
  maxWeight: rangeFieldError(maxWeight.value, WEIGHT_RANGE),
}));
const hasRangeErrors = computed(() => Object.values(rangeErrors.value).some(Boolean));

const professionItems = computed(() =>
  (TALENT_PROFESSIONS as readonly string[]).map(id => ({ value: id, title: t(id) })),
);
const genderItems = computed(() =>
  GENDERS.map(g => ({ value: g, title: t(`gender_${g}`) })),
);
const languageItems = computed(() =>
  LANGUAGE_CODES
    .map(code => ({ value: code, title: getLanguageDisplayName(code, locale.value) }))
    .filter((item): item is { value: string; title: string } => item.title !== null)
    .sort((a, b) => a.title.localeCompare(b.title, locale.value)),
);

const hasActiveFilters = computed(() =>
  !!q.value
  || professions.value.length > 0
  || locations.value.length > 0
  || educations.value.length > 0
  || languages.value.length > 0
  || genders.value.length > 0
  || hairColors.value.length > 0
  || eyeColors.value.length > 0
  || skinColors.value.length > 0
  || [minAge, maxAge, minHeight, maxHeight, minWeight, maxWeight].some(r => r.value !== ''),
);

// Only send fields the user actually set — an empty payload returns all talents.
const buildFilters = (): TalentSearchFilters => {
  const num = (v: string) => (v === '' ? undefined : Number(v));
  const filters: TalentSearchFilters = {};

  if (q.value.trim()) filters.q = q.value.trim();
  if (professions.value.length) filters.professions = professions.value;
  if (locations.value.length) filters.locations = locations.value;
  if (educations.value.length) filters.educations = educations.value;
  if (languages.value.length) filters.languages = languages.value;
  if (genders.value.length) filters.genders = genders.value;
  if (hairColors.value.length) filters.hairColors = hairColors.value;
  if (eyeColors.value.length) filters.eyeColors = eyeColors.value;
  if (skinColors.value.length) filters.skinColors = skinColors.value;

  if (num(minAge.value) != null) filters.minAge = num(minAge.value);
  if (num(maxAge.value) != null) filters.maxAge = num(maxAge.value);
  if (num(minHeight.value) != null) filters.minHeight = num(minHeight.value);
  if (num(maxHeight.value) != null) filters.maxHeight = num(maxHeight.value);
  if (num(minWeight.value) != null) filters.minWeight = num(minWeight.value);
  if (num(maxWeight.value) != null) filters.maxWeight = num(maxWeight.value);

  return filters;
};

const applyFilters = async () => {
  if (hasRangeErrors.value) return; // buttons are disabled too — this is a safety net

  loading.value = true;
  try {
    results.value = (await userStore.searchTalents(buildFilters())) ?? [];
  }
  finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  q.value = '';
  professions.value = [];
  locations.value = [];
  educations.value = [];
  languages.value = [];
  genders.value = [];
  hairColors.value = [];
  eyeColors.value = [];
  skinColors.value = [];
  [minAge, maxAge, minHeight, maxHeight, minWeight, maxWeight].forEach((r) => {
    r.value = '';
  });
  applyFilters();
};

onMounted(async () => {
  const meta = await userStore.getTalentListMeta();
  locationOptions.value = meta?.locations ?? [];
  educationOptions.value = meta?.educations ?? [];
  await applyFilters();
});
</script>

<style lang="scss" scoped>
.talents {
  // Two columns, with the sidebar spanning both rows so the search toolbar lines
  // up with the panel header and the results fill everything under it. Named
  // areas place the children, so the DOM can stay in reading order (search →
  // filters → results) without `order` faking a different one for the eye.
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  grid-template-areas:
    "filters toolbar"
    "filters results";
  align-items: start;
  column-gap: 24px;
  row-gap: 16px;
  width: 100%;

  // Below the tablet breakpoint the sidebar stops being a sidebar — everything
  // stacks into one column, in DOM order.
  @include tablet-down {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.filters {
  grid-area: filters;
  width: 310px;
  min-width: 310px;
  // Fit the panel below the cover header (~330px: nav + hero band + padding) so a
  // long filter list scrolls INSIDE the panel instead of forcing the whole page to
  // scroll. Once you scroll past the hero it sticks.
  position: sticky;
  top: 16px;
  align-self: start;
  max-height: calc(100vh - 330px);
  // Column with a scrollable body + a pinned footer, so Apply is always reachable.
  display: flex;
  flex-direction: column;

  // Stacked: a full-width block in the page flow — nothing to stick to and no
  // reason to cap its height, since it no longer competes with the results column.
  @include tablet-down {
    width: 100%;
    min-width: 0;
    position: static;
    max-height: none;
  }
}

.filters-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;

  @include tablet-down {
    overflow-y: visible;
    gap: 8px;
    // The page layout already supplies the horizontal padding.
    padding: 0;
  }
}

.filters-footer {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid color(--v-theme-on-surface, 0.12);

  @include tablet-down {
    padding: 16px 0 0;
    border-top: none;
  }
}

.footer-error {
  font-size: 12px;
  text-align: center;
  color: color(--v-theme-error);
}

.footer-actions {
  display: flex;
  gap: 8px;

  // Stacked: a centered pair of pills rather than a full-bleed Apply.
  @include tablet-down {
    justify-content: center;
  }
}

// Apply grows to fill; Clear (white / primary text) sits to its left.
.apply-btn {
  flex: 1;

  @include tablet-down {
    flex: 0 0 auto;
  }
}

.toolbar {
  grid-area: toolbar;
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;

  @include mobile {
    gap: 8px;
  }
}

// Input takes the slack, the Search button stays shrink-to-fit — the pair holds
// one row all the way down to 320px.
.search {
  flex: 1 1 auto;
  min-width: 0;
}

.search-btn {
  flex: 0 0 auto;
}

.user-grid {
  grid-area: results;
  // Fixed-width cards (see UserCard) packed with even 16px gutters.
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  // Below 960px the cards go fluid so every row divides the viewport evenly —
  // roughly 4 up at tablet widths, exactly 2 up on phones. UserCard reads these
  // custom properties (its 200x290 fallback still governs the desktop packing
  // above), so the grid track can own the width and the content the height.
  @include tablet-down {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));

    --user-card-width: auto;
    --user-card-height: auto;
  }

  @include mobile {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

.no-results {
  grid-area: results;
  display: flex;
  justify-content: center;
  padding: 64px 16px;
  color: color(--v-theme-on-surface, 0.6);
}

.filters-header {
  display: flex;
  gap: 12px;

  @include tablet-down {
    align-items: center;
  }
}

.filters-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

// Collapse control for the stacked panel. Hidden (and so untabbable) on desktop,
// where the sidebar is always open.
.filters-toggle {
  display: none;

  @include tablet-down {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    // 44px touch target: this is the ONLY control that opens the collapsed panel,
    // and it is the last thing before eleven facets — a near-miss on a 32px box
    // costs the user a scroll back up to try again.
    width: 44px;
    height: 44px;
    margin-right: -10px; // keep the glyph optically aligned with the edge
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    outline-offset: -2px;
  }
}

.filters-chevron {
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

.filters-body {
  display: flex;
  flex-direction: column;
  gap: 24px;

  // Collapsed by default once stacked, so the results stay one scroll away.
  @include tablet-down {
    display: none;
    gap: 8px;

    &.is-open {
      display: flex;
    }
  }
}

.range-row {
  display: flex;
  gap: 8px;

  > * {
    flex: 1;
    min-width: 0;
  }
}

@include tablet-down {
  // Rules off eleven stacked facets. A child component's root element inherits
  // this page's scope id, so `> *` reaches the FilterSection wrappers without
  // this file depending on the class names inside that component.
  .filters-body > * {
    border-bottom: 1px solid color(--v-theme-on-surface, 0.24);
  }
}
</style>
