<template>
  <div class="header-content">
    <div class="title">
      <h1>Kinoplatform</h1>
    </div>

    <div v-if="user" class="links">
      <a v-for="link in headerLinks"
        :class="[link === route.name && 'active']"
        @click="navigateTo(link, { event: $event })"
        :key="link">
        {{ $t(`common_${link.toLowerCase()}`) }}
      </a>
    </div>
    
    <div class="actions">
      <a v-if="user" :class="['user-link', route.name === 'User' && 'active']" @click="navigateTo('User', { event: $event })">{{ user.first_name + ' ' + user.last_name }}</a>
      <v-btn v-if="!user" variant="text" color="primary" @click="navigateTo('Login', { newTab: true })">{{ $t('common_login') }}</v-btn>
      <v-btn v-else variant="text" color="gray" @click="showLogoutDialog = true">{{ $t('common_logout') }}</v-btn>
      <LanguageSelector />
    </div>

    <v-dialog v-model="showLogoutDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('common_confirm_logout') }}
        </v-card-title>
        <v-card-text>
          {{ $t('common_are_you_sure_you_want_to_logout') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showLogoutDialog = false">
            {{ $t('common_cancel') }}
          </v-btn>
          <v-btn color="primary" variant="text" @click="confirmLogout">
            {{ $t('common_logout') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouteHelpers } from '@/composables/useRouteHelpers'
const { navigateTo } = useRouteHelpers()
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import LanguageSelector from '@/components/LanguageSelector.vue'

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const headerLinks = ["Home", "Crew",];

const route = useRoute();
const showLogoutDialog = ref(false);

const confirmLogout = async () => {
  showLogoutDialog.value = false;
  await authStore.logout();
  navigateTo('Login');
};
</script>

<style scoped lang="scss">
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $base-padding;
}

.title {
  color: color(--v-theme-primary);
}

.links {
  display: flex;
  gap: 16px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

a.active {
  color: color(--v-theme-primary);
}

.user-link {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  cursor: pointer;
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
