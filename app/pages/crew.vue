<template>
  <UserDirectory
    :users="crewUsers"
    :profession-items="professionItems"
    search-placeholder="crew_search_placeholder"
    no-results-text="crew_no_crew_members_found"
    :toggle-filters="toggleFilters"
  />
</template>

<script lang="ts" setup>
import type { User } from '~~/shared/types/user';
import { professions } from '~/utils/constants';
import { isCrew } from '~/utils/persona';
import UserDirectory from '~/components/UserDirectory.vue';

definePageMeta({
  header: { cover: true, slogan: 'crew_page_slogan', coverNav: false },
});

const { t } = useI18n();
const userStore = useUserStore();

const users = ref<User[]>([]);
// Only crew here — someone who is both crew and talent shows on both pages.
const crewUsers = computed(() => users.value.filter(u => isCrew(u.profession) || (u.profession ?? []).includes('my father')));

const professionItems = computed(() =>
  professions.map(id => ({ value: id, title: t(id) })),
);

// Crew-specific toggle: has a portfolio (URL or uploaded file).
const toggleFilters = [
  {
    key: 'portfolio',
    label: 'crew_filter_has_portfolio',
    predicate: (u: User) => !!u.portfolio || !!u.portfolioFile,
  },
];

onMounted(async () => {
  users.value = (await userStore.getAllUsers()) ?? [];
});
</script>
