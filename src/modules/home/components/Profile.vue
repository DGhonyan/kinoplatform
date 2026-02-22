<template>
  <div class="profile">
    <UserProfile v-if="!showAddPersonalInfo" :userId="userId" />
    <AddPersonalInfo v-else />
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import UserProfile from '@/modules/home/components/profile/UserProfile.vue';
import AddPersonalInfo from '@/modules/home/components/profile/AddPersonalInfo.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userId = computed(() => route.params.id as string);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const showAddPersonalInfo = computed(() => {
  return !user.value?.active;
});
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>