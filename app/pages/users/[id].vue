<template>
  <div class="profile">
    <UserProfile :user-id="userId" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const userId = computed(() => route.params.id as string);
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
