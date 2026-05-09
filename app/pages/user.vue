<template>
  <div class="profile">
    <UserProfile
      v-if="!showAddPersonalInfo"
      :user-id="undefined"
    />
    <AddPersonalInfo v-else />
  </div>
</template>

<script lang="ts" setup>
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const showAddPersonalInfo = computed(() => {
  return user.value && !user.value?.active;
});
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
