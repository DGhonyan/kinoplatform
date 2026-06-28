<template>
  <div class="crew">
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

        <div class="filters-section">
          <v-switch
            v-model="hasPortfolioOnly"
            :label="$t('crew_filter_has_portfolio')"
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
          :placeholder="$t('crew_search_placeholder')"
          prepend-inner-icon="mdi-magnify"
          bg-color="on-surface"
          color="background"
          text-color="background"
          rounded="pill"
          density="comfortable"
          hide-details
        />
      </div>

      <!-- Crew grid -->
      <div
        v-if="filteredUsers.length > 0"
        class="crew-grid"
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
        <span>{{ $t('crew_no_crew_members_found') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { User } from '~~/shared/types/user';
import { professions } from '~/utils/constants';
import {
  LANGUAGE_CODES,
  getLanguageDisplayName,
} from '~/utils/languages';
import Select from '~/components/Select.vue';

definePageMeta({
  header: { cover: true, slogan: 'crew_page_slogan', coverNav: false },
});

const { t, locale } = useI18n();
const userStore = useUserStore();

const users = ref<User[]>([]);

// Top-level filters — always visible.
const search = ref('');

// Drawer filters — opened via the funnel icon. Kept separate so we can show
// a dot on the icon button when any of them are active.
const selectedProfessions = ref<string[]>([]);
const selectedLocations = ref<string[]>([]);
const selectedLanguages = ref<string[]>([]);
const hasPortfolioOnly = ref(false);

// Items for the drawer multi-selects.
const professionItems = computed(() =>
  professions.map(id => ({ value: id, title: t(id) })),
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
  const locations = users.value
    .map(u => u.location?.trim())
    .filter((loc): loc is string => Boolean(loc));
  return [...new Set(locations)].sort();
});

const activeDrawerFilterCount = computed(() =>
  selectedProfessions.value.length
  + selectedLocations.value.length
  + selectedLanguages.value.length
  + (hasPortfolioOnly.value ? 1 : 0),
);

const clearDrawerFilters = () => {
  selectedProfessions.value = [];
  selectedLocations.value = [];
  selectedLanguages.value = [];
  hasPortfolioOnly.value = false;
};

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim();

  return users.value.filter((user) => {
    // Search: name OR translated profession label.
    if (q) {
      const haystack = [
        user.firstName,
        user.lastName,
        ...user.profession.map(p => t(p)),
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Profession (drawer): same any-of logic.
    if (selectedProfessions.value.length > 0) {
      if (!selectedProfessions.value.some(p => user.profession.includes(p))) return false;
    }

    // Location (drawer): exact match against the user's stored location.
    if (selectedLocations.value.length > 0) {
      if (!user.location || !selectedLocations.value.includes(user.location)) return false;
    }

    // Languages (drawer): user must speak at least one of the selected languages.
    if (selectedLanguages.value.length > 0) {
      const langs = user.languages ?? [];
      if (!selectedLanguages.value.some(l => langs.includes(l))) return false;
    }

    // Has portfolio (drawer): URL or PDF blob counts.
    if (hasPortfolioOnly.value) {
      if (!user.portfolio && !user.portfolioFile) return false;
    }

    return true;
  });
});

onMounted(async () => {
  users.value = (await userStore.getAllUsers()) ?? [];
});
</script>

<style lang="scss" scoped>
.crew {
  display: flex;
  width: 100%;
  gap: 24px;
}

.filters {
  width: 310px;
  min-width: 310px;
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

.filter-btn {
  position: relative;
  flex-shrink: 0;
}

.filter-btn.has-filters :deep(.v-btn__overlay) {
  background: rgba(var(--v-theme-primary), 0.08);
}

.filter-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
}

.chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px; // breathing room for any focus ring/shadow

  // Hide the scrollbar visually but keep it functional.
  scrollbar-width: thin;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-on-surface), 0.2);
    border-radius: 3px;
  }
}

.field-chip {
  flex-shrink: 0;
}

.crew-grid {
  // Fixed-width cards (see UserCard) packed with even 16px gutters — the old
  // auto-fill 1fr grid stretched the cells wider than the cards, so the visible
  // gaps were larger than the gap value and uneven row-to-row.
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.no-results {
  display: flex;
  justify-content: center;
  padding: 64px 16px;
  color: rgba(var(--v-theme-on-surface), 0.6);
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

.filters-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
