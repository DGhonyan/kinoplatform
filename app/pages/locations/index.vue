<template>
  <!-- One form: Enter from any field runs the search, and the sidebar's Apply is
       the same submit — filtering is server-side (see the location store), so a
       round trip per checkbox tick would be needlessly chatty. -->
  <form
    class="locations"
    @submit.prevent="applyFilters"
  >
    <div class="page-head">
      <div class="head-text">
        <h1 class="page-title">
          {{ $t('locations_title') }}
        </h1>
        <p class="page-subtitle">
          {{ $t('locations_subtitle') }}
        </p>
      </div>
      <!-- Admins author the catalogue, so the shortcut lives where they already
           are. `type="button"` matters: the page is one <form> and the default
           would submit the filters instead of opening the popup. -->
      <Button
        v-if="isAdmin"
        type="button"
        color="primary"
        prepend-icon="mdi-plus"
        @click="showForm = true"
      >
        {{ $t('location_form_create_title') }}
      </Button>
    </div>

    <!-- The search row comes FIRST in the DOM. Stacked (below 960px) it is also
         visually first, so keyboard and screen-reader users reach it immediately
         instead of tabbing through the whole facet list. Desktop puts it back in
         the right-hand column via grid areas — placement, not `order`, so the two
         orders can never diverge. -->
    <SearchToolbar
      v-model="q"
      class="toolbar"
      placeholder="locations_search_placeholder"
      maxlength="100"
      show-button
      :loading="loading"
    />

    <FilterPanel
      class="filters"
      :clearable="hasActiveFilters"
      show-apply
      :apply-loading="loading"
      @clear="clearFilters"
    >
      <!-- The section header is the facet's only visible name, so each
           control gets an aria-label instead of its own visible label. -->
      <FilterSection title="locations_filter_city">
        <Select
          v-model="city"
          :items="cityOptions"
          :aria-label="$t('locations_filter_city')"
          density="compact"
          clearable
        />
      </FilterSection>

      <!-- Min and Max share one header, so the header alone would give both
           fields the same name — boundLabel() keeps them apart. -->
      <FilterSection title="locations_filter_price">
        <div class="range-row">
          <Input
            v-model="minPrice"
            type="number"
            min="0"
            step="1000"
            :placeholder="$t('talent_filter_min')"
            :aria-label="boundLabel('locations_filter_price', 'talent_filter_min')"
            hide-details="auto"
            density="compact"
          />
          <Input
            v-model="maxPrice"
            type="number"
            min="0"
            step="1000"
            :placeholder="$t('talent_filter_max')"
            :aria-label="boundLabel('locations_filter_price', 'talent_filter_max')"
            hide-details="auto"
            density="compact"
          />
        </div>
      </FilterSection>

      <FilterSection title="locations_filter_building_type">
        <Select
          v-model="buildingType"
          :items="buildingTypeItems"
          :aria-label="$t('locations_filter_building_type')"
          density="compact"
          clearable
        />
      </FilterSection>

      <FilterSection title="locations_filter_rooms">
        <Input
          v-model="minRooms"
          type="number"
          min="1"
          step="1"
          :placeholder="$t('talent_filter_min')"
          :aria-label="boundLabel('locations_filter_rooms', 'talent_filter_min')"
          hide-details="auto"
          density="compact"
        />
      </FilterSection>

      <FilterSection title="locations_filter_crew">
        <Input
          v-model="minCrew"
          type="number"
          min="1"
          step="1"
          :placeholder="$t('talent_filter_min')"
          :aria-label="boundLabel('locations_filter_crew', 'talent_filter_min')"
          hide-details="auto"
          density="compact"
        />
      </FilterSection>

      <FilterSection title="locations_filter_amenities">
        <Select
          v-model="amenities"
          :items="amenityItems"
          :aria-label="$t('locations_filter_amenities')"
          density="compact"
          multiple
        />
      </FilterSection>
    </FilterPanel>

    <div
      v-if="loading"
      class="state"
    >
      <v-progress-circular
        indeterminate
        size="28"
        width="3"
        color="primary"
      />
    </div>

    <div
      v-else-if="results.length"
      class="location-grid"
    >
      <LocationCard
        v-for="location in results"
        :key="location._id"
        :location="location"
      />
    </div>

    <p
      v-else
      class="no-results"
    >
      {{ $t('locations_none') }}
    </p>
    <!-- Admin-only create. Kept in create mode here (no `location` prop);
         /admin/locations owns editing and deleting. -->
    <LocationFormPopup
      v-if="isAdmin"
      v-model="showForm"
      @saved="onCreated"
    />
  </form>
</template>

<script lang="ts" setup>
import type { Location, LocationAmenity, LocationQuery } from '~~/shared/types/location';
import { LOCATION_AMENITIES, LOCATION_BUILDING_TYPES } from '~~/shared/types/location';
import Button from '~/components/Button.vue';
import Input from '~/components/Input.vue';
import Select from '~/components/Select.vue';
import FilterSection from '~/components/FilterSection.vue';
import FilterPanel from '~/components/FilterPanel.vue';
import SearchToolbar from '~/components/SearchToolbar.vue';
import LocationCard from '~/components/locations/LocationCard.vue';
import LocationFormPopup from '~/components/locations/LocationFormPopup.vue';

// Public page (in the auth allowlist) — guests browse the marketplace before
// signing up, and only hit /login when they actually send a booking request.
const { t } = useI18n();
const locationStore = useLocationStore();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.user?.type === 'admin');
const showForm = ref(false);

const results = ref<Location[]>([]);
const loading = ref(true);
const cityOptions = ref<string[]>([]);

// ── Filter state ──
const q = ref('');
const city = ref<string | null>(null);
const buildingType = ref<string | null>(null);
const minPrice = ref('');
const maxPrice = ref('');
const minRooms = ref('');
const minCrew = ref('');
const amenities = ref<LocationAmenity[]>([]);

// ── Stacked panel (below 960px) ──
// The sidebar turns into a full-width block above the results, collapsed by
// default so the grid stays one scroll away. The layout switch is pure CSS; this
// state only drives the panel's own collapse. Above 960px the toggle is
// `display: none` and the body never gets the collapsed rule, so it's inert
// there. Each facet owns its own open/closed state inside FilterSection.

// A facet whose header covers two controls needs a per-field name. Composed from
// keys we already ship (facet first, matching the visual order) rather than
// adding near-duplicate ones.
const boundLabel = (facetKey: string, boundKey: string) => `${t(facetKey)} ${t(boundKey)}`;

const buildingTypeItems = computed(() =>
  LOCATION_BUILDING_TYPES.map(type => ({ value: type, title: t(`location_building_${type}`) })),
);
const amenityItems = computed(() =>
  LOCATION_AMENITIES.map(id => ({ value: id, title: t(`location_amenity_${id}`) })),
);

const hasActiveFilters = computed(() =>
  !!q.value
  || !!city.value
  || !!buildingType.value
  || amenities.value.length > 0
  || [minPrice, maxPrice, minRooms, minCrew].some(r => r.value !== ''),
);

// Only send what the user actually set — an empty query returns the whole
// catalogue, which is exactly what the first paint wants.
const buildQuery = (): LocationQuery => {
  const num = (value: string) => {
    const parsed = Number(value.trim());
    return value.trim() === '' || !Number.isFinite(parsed) ? undefined : parsed;
  };
  const query: LocationQuery = {};

  if (q.value.trim()) query.q = q.value.trim();
  if (city.value) query.city = city.value;
  if (buildingType.value) query.buildingType = buildingType.value;
  if (amenities.value.length) query.amenities = [...amenities.value];

  const min = num(minPrice.value);
  const max = num(maxPrice.value);
  const rooms = num(minRooms.value);
  const crew = num(minCrew.value);
  if (min !== undefined) query.minPrice = min;
  if (max !== undefined) query.maxPrice = max;
  if (rooms !== undefined) query.minRooms = rooms;
  if (crew !== undefined) query.minCrew = crew;

  return query;
};

// Guard against out-of-order responses: a slow earlier search must not clobber a
// newer one when the user submits twice in quick succession.
let loadSeq = 0;
const applyFilters = async () => {
  const seq = ++loadSeq;
  loading.value = true;
  const data = await locationStore.listLocations(buildQuery());
  if (seq !== loadSeq) return; // superseded by a newer search
  results.value = data ?? [];
  loading.value = false;
};

// A new listing may not match the active filters, so re-run the current search
// rather than optimistically prepending it — the board stays truthful about
// what the filters say.
const onCreated = () => applyFilters();

const clearFilters = () => {
  q.value = '';
  city.value = null;
  buildingType.value = null;
  amenities.value = [];
  [minPrice, maxPrice, minRooms, minCrew].forEach((r) => {
    r.value = '';
  });
  applyFilters();
};

onMounted(async () => {
  // The city facet's options and the first results page don't depend on each
  // other, so both round trips overlap instead of stacking.
  const [cities] = await Promise.all([locationStore.listCities(), applyFilters()]);
  cityOptions.value = cities ?? [];
});
</script>

<style lang="scss" scoped>
.filters {
  grid-area: filters;
}

.locations {
  // Two columns, with the sidebar spanning the toolbar and results rows so the
  // search bar lines up with the panel header. Named areas place the children,
  // so the DOM can stay in reading order (heading → search → filters → results)
  // without `order` faking a different one for the eye.
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  grid-template-areas:
    "head head"
    "filters toolbar"
    "filters results";
  // `.filters` spans the toolbar AND results rows. Whenever the sidebar is
  // taller than those two combined — which is the normal case on a wide screen,
  // where every card fits on one short row — the grid grows the spanned rows to
  // fit it and the surplus inflates the TOOLBAR row, opening a gap under the
  // search bar. Pinning the first two rows to their content sends all of that
  // slack into the results row instead, where it's invisible.
  grid-template-rows: auto auto 1fr;
  align-items: start;
  column-gap: 24px;
  row-gap: 16px;
  width: 100%;

  // No room for a sidebar below tablet — everything stacks in DOM order.
  @include tablet-down {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.page-head {
  grid-area: head;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 15px;
  opacity: 0.7;
}

// Apply grows to fill; Clear (white / primary text) sits to its left.

// Placement only — the bar's own layout lives in SearchToolbar.
.toolbar {
  grid-area: toolbar;
}

.location-grid {
  grid-area: results;
  // The track owns the card width here (LocationCard reads this custom property
  // and falls back to its fixed 280px elsewhere), so every row divides the
  // column evenly instead of leaving a ragged gutter.
  --location-card-width: auto;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;

  // Exactly 2 up on phones — a third column would put the photo below ~110px.
  @include mobile {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

.state {
  grid-area: results;
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}

.no-results {
  grid-area: results;
  margin: 0;
  display: flex;
  justify-content: center;
  padding: 64px 16px;
  color: color(--v-theme-on-surface, 0.6);
}

// Collapse control for the stacked panel. Hidden (and so untabbable) on desktop,
// where the sidebar is always open.

.range-row {
  display: flex;
  gap: 8px;

  > * {
    flex: 1;
    min-width: 0;
  }
}
</style>
