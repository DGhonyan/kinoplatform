<template>
  <div class="crew">
    <div class="filters">
      <div class="filters-content">
        <div class="filters-header">
          <h2 class="filters-title">
            {{ $t('crew_filters') }}
          </h2>
          <v-btn
            v-if="activeDrawerFilterCount > 0"
            variant="text"
            color="primary"
            size="small"
            @click="clearDrawerFilters"
          >
            {{ $t('crew_filter_clear_all') }}
          </v-btn>
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
        <button
          v-for="user in filteredUsers"
          :key="user._id"
          type="button"
          class="user-card"
          @click="navigateTo(`/users/${user._id}`)"
        >
          <img
            :src="getUserAvatar(user)"
            :alt="`${user.firstName} ${user.lastName}`"
            class="avatar"
          >
          <div class="user-info">
            <h3 class="user-name">
              {{ user.firstName }} {{ user.lastName }}
            </h3>
            <p class="user-profession">
              {{ user.profession.map(p => $t(p)).join(', ') }}
            </p>
          </div>
        </button>
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

const { t, locale } = useI18n();
const fileStore = useFileStore();
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

const getUserAvatar = (user: User) => {
  if (user.avatar) return fileStore.composeFileUrl(user.avatar);
  return new URL('@/assets/default.jpg', import.meta.url).href;
};

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
  display: grid;
  // Auto-fill so the grid responsively reflows from 6 cols on a wide desktop
  // down to 1 col on phones, without media queries.
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.user-card {
  width: 200px;
  height: 290px;

  max-width: 200px;
  max-height: 290px;

  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
}

.avatar {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.user-profession {
  font-size: 13px;
  color: rgb(var(--v-theme-primary));
  margin: 0;
  // Cap at two lines so cards stay uniform height regardless of role count.
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  justify-content: space-between;
  align-items: center;
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
