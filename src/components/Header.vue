<template>
  <div class="header-content">
    <div class="title">
      <h1>Kinoplatform</h1>
    </div>

    <div class="links">
      <a v-for="route in routes"
        @click="navigateTo(route.name, { event: $event })"
        :key="route.path">
        {{ route.name }}
      </a>
    </div>

    <div class="actions">
      <v-btn v-if="!user" variant="text" color="primary" @click="navigateTo('Login', { newTab: true })">Login</v-btn>
      <v-btn v-else variant="text" color="primary" @click="logout()">Logout</v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouteHelpers } from '@/composables/useRouteHelpers'
const { navigateTo } = useRouteHelpers()
import { routes } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const logout = async () => {
  await authStore.logout();
  navigateTo('Login');
}
</script>

<style scoped lang="scss">
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $base-padding;
}

.links {
  display: flex;
  gap: 16px;
}

.links a {
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.links a:visited {
  color: color(--v-theme-black);
}

.links a:hover {
  color: color(--v-theme-primary);
}
</style>
