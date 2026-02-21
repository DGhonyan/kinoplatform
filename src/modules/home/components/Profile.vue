<template>
  <div class="profile">
    <MyProfile v-if="user?.active" />
    <AddPersonalInfo v-else />
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import MyProfile from '@/modules/home/components/profile/MyProfile.vue'
import AddPersonalInfo from '@/modules/home/components/profile/AddPersonalInfo.vue'

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>