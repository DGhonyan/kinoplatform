<template>
  <div class="crew">
    <div class="toolbar">
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
      />
    </div>

    <div class="crew-list">
      <div v-for="user in filteredUsers" :key="user._id" class="item">
        <div class="item-avatar">
            <img :src="getUserAvatar()" alt="User Avatar" />
        </div>
        <div class="item-content">
          <h3 class="item-name" @click="navigateTo('Users', { params: { id: user._id } })">{{ user.first_name }} {{ user.last_name }}</h3>
          <p class="item-profession">{{ user.profession.join(', ') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/user'
import { useRouteHelpers } from '@/composables/useRouteHelpers'

const { navigateTo } = useRouteHelpers();

const getUserAvatar = () => {
  return new URL(`@/assets/default.jpg`, import.meta.url).href
}

const users = ref<User[]>([])

const userStore = useUserStore();
const { getAllUsers } = userStore;

const filteredUsers = computed(() => {
  return users.value.filter((user) => user.first_name.toLowerCase().includes(search.value.toLowerCase()) 
    || user.last_name.toLowerCase().includes(search.value.toLowerCase()) || user.profession.some((profession) => profession.toLowerCase().includes(search.value.toLowerCase())))
})

const search = ref('')

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
  gap: 16px;
}

.crew-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 200px;

  .item-avatar {
    width: 100%;
    height: 100%;
    display: flex;
  
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .item-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
}

.item-profession {
  text-align: center;
  font-size: 12px;
  color: color(--v-theme-primary);
}

.item-name:hover {
  cursor: pointer;
  color: color(--v-theme-gray300);
}

</style>