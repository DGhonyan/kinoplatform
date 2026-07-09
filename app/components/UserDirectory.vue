<template>
  <div class="directory">
    <div class="filters">
      <div class="filters-content">
        <div class="filters-header">
          <v-icon>custom:filter</v-icon>
          <h2 class="filters-title">
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
        </div>

        <div class="filters-section">
          <Select
            v-model="selectedProfessions"
            :items="professionItems"
            label="crew_filter_profession"
            multiple
          />
        </div>

        <div class="filters-section">
          <Select
            v-model="selectedLocations"
            :items="locationOptions"
            label="crew_filter_location"
            multiple
          />
        </div>

        <div class="filters-section">
          <Select
            v-model="selectedLanguages"
            :items="languageItems"
            label="crew_filter_languages"
            multiple
          />
        </div>

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

    <div class="main-content">
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
  </div>
</template>

<script lang="ts" setup>
import type { User } from '~~/shared/types/user';
import {
  LANGUAGE_CODES,
  getLanguageDisplayName,
} from '~/utils/languages';
import Select from '~/components/Select.vue';

/**
 * Shared crew/talents directory: filter sidebar (profession + location + language
 * + any page-specific toggles) and a grid of UserCards. The page owns the base
 * list (`users`, already scoped to crew or talents) and the profession options;
 * this component owns the client-side filtering and layout.
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
  display: flex;
  width: 100%;
  gap: 24px;
}

.filters {
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
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;
}

.search {
  flex: 1;
}

.user-grid {
  // Fixed-width cards (see UserCard) packed with even 16px gutters.
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.no-results {
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
}

.filters-header {
  display: flex;
  gap: 12px;
}

.filters-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
