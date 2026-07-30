<template>
  <div class="directory">
    <!-- No Search button: this directory filters live as you type. -->
    <SearchToolbar
      v-model="search"
      class="toolbar"
      :placeholder="searchPlaceholder"
    />

    <!-- No Apply: this panel filters client-side as you change it. -->
    <FilterPanel
      class="filters"
      :clearable="activeDrawerFilterCount > 0"
      @clear="clearDrawerFilters"
    >
      <!-- Section headers name the facet, so each control gets an aria-label instead. -->
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
    </FilterPanel>

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
import FilterPanel from '~/components/FilterPanel.vue';
import SearchToolbar from '~/components/SearchToolbar.vue';

// Shared crew/talents directory: the page owns the base list and profession
// options; this component owns the client-side filtering and layout.
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

// Derived from the data itself — cheap autocomplete without a separate dataset.
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
.filters {
  grid-area: filters;
}

.directory {
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  grid-template-areas:
    "filters toolbar"
    "filters results";
  // Pin the toolbar row to its content: the sidebar spans both rows, and when
  // it's taller the surplus would otherwise open a gap under the search bar.
  grid-template-rows: auto 1fr;
  align-items: start;
  column-gap: 24px;
  row-gap: 16px;
  width: 100%;

  // No room for a sidebar below tablet — everything stacks in DOM order.
  @include tablet-down {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

// Placement only — the bar's own layout lives in SearchToolbar.
.toolbar {
  grid-area: toolbar;
}

.user-grid {
  grid-area: results;
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 16px;

  // 160px floor rather than a fixed column count — a hard 4-up at 600px gives
  // ~130px cards. Same track as /talents so both directories match.
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

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
