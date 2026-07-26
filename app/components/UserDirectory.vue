<template>
  <div class="directory">
    <div class="toolbar">
      <Input
        v-model="search"
        class="search"
        :placeholder="$t(searchPlaceholder)"
        prepend-inner-icon="mdi-magnify"
        bg-color="on-surface"
        color="background"
        text-color="background"
        rounded="pill"
        density="comfortable"
        hide-details
      />
    </div>

    <div class="filters">
      <div class="filters-content">
        <div class="filters-header">
          <v-icon>custom:filter</v-icon>
          <h2
            :id="titleId"
            class="filters-title"
          >
            {{ $t('crew_filters') }}
          </h2>
          <Button
            v-if="activeDrawerFilterCount > 0"
            variant="text"
            color="primary"
            size="small"
            @click="clearDrawerFilters"
          >
            {{ $t('crew_filter_clear_all') }}
          </Button>
          <!-- CSS shows this only below tablet, where the panel stacks above the
               grid; `display: none` keeps it out of the desktop tab order. -->
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
              v-model="selectedProfessions"
              :items="professionItems"
              :aria-label="$t('crew_filter_profession')"
              multiple
            />
          </FilterSection>

          <FilterSection title="crew_filter_location">
            <Select
              v-model="selectedLocations"
              :items="locationOptions"
              :aria-label="$t('crew_filter_location')"
              multiple
            />
          </FilterSection>

          <FilterSection title="crew_filter_languages">
            <Select
              v-model="selectedLanguages"
              :items="languageItems"
              :aria-label="$t('crew_filter_languages')"
              multiple
            />
          </FilterSection>

          <div
            v-for="toggle in toggleFilters"
            :key="toggle.key"
            class="filters-section"
          >
            <v-switch
              v-model="toggleState[toggle.key]"
              :label="$t(toggle.label)"
              color="primary"
              density="comfortable"
              hide-details
              inset
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="filteredUsers.length > 0"
      class="user-grid"
    >
      <UserCard
        v-for="user in filteredUsers"
        :key="user._id"
        :user="user"
      />
    </div>

    <div
      v-else
      class="no-results"
    >
      <span>{{ $t(noResultsText) }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { User } from '~~/shared/types/user';
import {
  LANGUAGE_CODES,
  getLanguageDisplayName,
} from '~/utils/languages';
import Select from '~/components/Select.vue';
import FilterSection from '~/components/FilterSection.vue';

/**
 * Shared crew/talents directory: filter sidebar (profession + location + language
 * + any page-specific toggles) and a grid of UserCards. The page owns the base
 * list (`users`, already scoped to crew or talents) and the profession options;
 * this component owns the client-side filtering and layout.
 *
 * Layout is a two-column grid on desktop (sidebar | search + results) that
 * collapses to a single stacked column below tablet — see the styles below.
 */
type ToggleFilter = { key: string; label: string; predicate: (user: User) => boolean };

const props = withDefaults(defineProps<{
  users: User[];
  professionItems: { value: string; title: string }[];
  /** i18n key for the search box placeholder. */
  searchPlaceholder: string;
  /** i18n key shown when nothing matches. */
  noResultsText: string;
  /** Extra boolean filters rendered as switches (e.g. has-portfolio). */
  toggleFilters?: ToggleFilter[];
}>(), {
  toggleFilters: () => [],
});

const { t, locale } = useI18n();

// Collapse state for the stacked (below-tablet) filter panel. Desktop ignores it
// — the panel is a permanently open sidebar there.
const filtersOpen = ref(false);
const titleId = useId();
const bodyId = useId();

const search = ref('');
const selectedProfessions = ref<string[]>([]);
const selectedLocations = ref<string[]>([]);
const selectedLanguages = ref<string[]>([]);
const toggleState = reactive<Record<string, boolean>>(
  Object.fromEntries(props.toggleFilters.map(f => [f.key, false])),
);

const languageItems = computed(() =>
  LANGUAGE_CODES
    .map(code => ({ value: code, title: getLanguageDisplayName(code, locale.value) }))
    .filter((item): item is { value: string; title: string } => item.title !== null)
    .sort((a, b) => a.title.localeCompare(b.title, locale.value)),
);

// Location options are derived from the data we have — every distinct
// `user.location` string. Cheap autocomplete without a separate dataset.
const locationOptions = computed(() => {
  const locations = props.users
    .map(u => u.location?.trim())
    .filter((loc): loc is string => Boolean(loc));
  return [...new Set(locations)].sort();
});

const activeDrawerFilterCount = computed(() =>
  selectedProfessions.value.length
  + selectedLocations.value.length
  + selectedLanguages.value.length
  + props.toggleFilters.filter(f => toggleState[f.key]).length,
);

const clearDrawerFilters = () => {
  selectedProfessions.value = [];
  selectedLocations.value = [];
  selectedLanguages.value = [];
  props.toggleFilters.forEach((f) => {
    toggleState[f.key] = false;
  });
};

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim();

  return props.users.filter((user) => {
    // Search: name OR translated profession label.
    if (q) {
      const haystack = [
        user.firstName,
        user.lastName,
        ...(user.profession ?? []).map(p => t(p)),
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Profession (any-of).
    if (selectedProfessions.value.length > 0) {
      if (!selectedProfessions.value.some(p => (user.profession ?? []).includes(p))) return false;
    }

    // Location (exact match against the stored location).
    if (selectedLocations.value.length > 0) {
      if (!user.location || !selectedLocations.value.includes(user.location)) return false;
    }

    // Languages (any-of).
    if (selectedLanguages.value.length > 0) {
      const langs = user.languages ?? [];
      if (!selectedLanguages.value.some(l => langs.includes(l))) return false;
    }

    // Page-specific toggles.
    for (const toggle of props.toggleFilters) {
      if (toggleState[toggle.key] && !toggle.predicate(user)) return false;
    }

    return true;
  });
});
</script>

<style lang="scss" scoped>
.directory {
  // The sidebar spans both rows so the search bar lines up with its header and
  // the results fill everything under it.
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  grid-template-areas:
    "filters toolbar"
    "filters results";
  align-items: start;
  column-gap: 24px;
  row-gap: 16px;
  width: 100%;

  // No room for a sidebar below tablet — everything stacks in DOM order
  // (search, filter panel, results), matching the mobile design.
  @include tablet-down {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.filters {
  grid-area: filters;
  width: 310px;
  min-width: 310px;
  // Sticky + independently scrollable; capped to fit below the cover header (see
  // talents.vue) so a long filter list scrolls in-panel rather than growing the
  // page. Crew's short list stays well under this cap.
  position: sticky;
  top: 16px;
  align-self: flex-start;
  max-height: calc(100vh - 330px);
  overflow-y: auto;

  // Stacked full-width block: the page scrolls it, so drop the sticky cap that
  // would otherwise trap the whole panel in a short scroll box.
  @include tablet-down {
    width: 100%;
    min-width: 0;
    position: static;
    max-height: none;
    overflow: visible;
  }
}

.toolbar {
  grid-area: toolbar;
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;
}

.search {
  // min-width:0 lets the field give way instead of pushing a sibling (e.g. a
  // submit button) onto a second row at narrow widths.
  flex: 1;
  min-width: 0;
}

.user-grid {
  grid-area: results;
  // Fixed-width cards (see UserCard) packed with even 16px gutters.
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 16px;

  // Below tablet the cards stretch to fill their track instead of holding their
  // desktop width. A 160px floor rather than a fixed 4 columns: at 600px a hard
  // 4-up gives ~130px cards (clipped names, tiny avatars) and UserCard's mobile
  // type trims don't apply until 599.98px. Same track as /talents, so the two
  // directories render the identical card at the identical size.
  @include tablet-down {
    --user-card-width: auto;
    --user-card-height: auto;

    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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

// Drawer
.filters-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;

  @include tablet-down {
    gap: 16px;
    // The page supplies the edge padding once the panel goes full-width, so
    // the filters line up with the search bar and the grid.
    padding: 0;
  }
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
    // 44px touch target: this is the ONLY control that opens the collapsed
    // panel, and it sits right beside "Clear all" — a near-miss used to wipe
    // the user's filters instead of expanding the panel.
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

  // Collapsed by default once stacked, so the results grid stays one scroll away.
  @include tablet-down {
    display: none;
    gap: 16px;

    &.is-open {
      display: flex;
    }
  }
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
