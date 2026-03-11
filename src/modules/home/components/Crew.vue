<template>
  <div class="crew">
    <div class="toolbar">
      <v-text-field
        v-model="search"
        :label="t('crew_search_by_name')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
      />
      <v-autocomplete
        v-model="selectedProfessions"
        :label="t('crew_filter_by_profession')"
        :items="professionOptions.map(profession => ({ title: $t(profession), value: profession }))"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        multiple
        chips
        autocomplete="suppress"
      />
    </div>

    <div class="crew-list">
      <v-card
        v-for="user in filteredUsers"
        :key="user._id"
        class="user-card"
        @click="navigateTo('Users', { params: { id: user._id } })"
      >
        <div class="card-content">
          <div class="avatar-container">
            <img :src="getUserAvatar(user)" alt="User Avatar" class="avatar" />
          </div>
          <div class="user-info">
            <h3 class="user-name">{{ user.first_name }} {{ user.last_name }}</h3>
            <p class="user-profession">{{ user.profession.map(profession => $t(profession)).join(', ') }}</p>
          </div>
        </div>
      </v-card>
    </div>

    <div v-if="filteredUsers.length === 0" class="no-results">
      <span>{{ $t('crew_no_crew_members_found') }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useFileStore } from '@/stores/file'
import type { User } from '@/types/user'
import { useRouteHelpers } from '@/composables/useRouteHelpers'
import { useI18n } from 'vue-i18n';

const { navigateTo } = useRouteHelpers();
const fileStore = useFileStore();
const { t } = useI18n();
const getUserAvatar = (user: User) => {
  if (user.avatar) {
    return fileStore.composeFileUrl(user.avatar);
  }
  return new URL(`@/assets/default.jpg`, import.meta.url).href;
};

const users = ref<User[]>([]);
const search = ref('');
const selectedProfessions = ref<string[]>([]);

const userStore = useUserStore();
const { getAllUsers } = userStore;

const professionOptions = computed(() => {
  const allProfessions = users.value.flatMap(user => user.profession);
  return [...new Set(allProfessions)].sort();
});

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(search.value.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.value.toLowerCase());
    
    const matchesProfession = 
      selectedProfessions.value.length === 0 || 
      user.profession.some(prof => selectedProfessions.value.includes(prof));
    
    return matchesSearch && matchesProfession;
  });
});

onMounted(async () => {
  try {
    const usersData = await getAllUsers();
    users.value = usersData;
  } catch (error) {
    console.error('Failed to get all users', error);
  }
});
</script>

<style lang="scss" scoped>
.crew {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;

  > * {
    flex: 1;
    min-width: 200px;
  }
}

.crew-list {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 80%;
  gap: 12px;
}

.user-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(var(--v-theme-primary), 0.2);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 500;
  color: color(--v-theme-gray);
  margin: 0;
}

.user-profession {
  font-size: 14px;
  color: color(--v-theme-primary);
  margin: 0;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: color(--v-theme-gray);
  opacity: 0.7;
  font-size: 16px;
}
</style>