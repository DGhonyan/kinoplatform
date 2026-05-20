<template>
  <div class="header-content">
    <div class="title">
      <h1>Kinoplatform</h1>
    </div>

    <div
      v-if="user"
      class="links"
    >
      <NuxtLink
        v-for="link in headerLinks"
        :key="link.path"
        :to="link.path"
        class="nav-link"
        :class="{ active: route.path === link.path }"
      >
        {{ $t(link.label) }}
      </NuxtLink>
    </div>

    <div class="actions">
      <NuxtLink
        v-if="user"
        to="/user"
        class="user-link"
        :class="{ active: route.path === '/user' }"
      >
        {{ userFullName }}
      </NuxtLink>
      <v-btn
        v-if="!user"
        variant="text"
        color="primary"
        @click="navigateTo('/login')"
      >
        {{ $t('common_login') }}
      </v-btn>
      <v-btn
        v-else
        variant="text"
        color="gray"
        @click="showLogoutDialog = true"
      >
        {{ $t('common_logout') }}
      </v-btn>
      <LanguageSelector />
    </div>

    <v-dialog
      v-model="showLogoutDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('common_confirm_logout') }}
        </v-card-title>
        <v-card-text>
          {{ $t('common_are_you_sure_you_want_to_logout') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showLogoutDialog = false"
          >
            {{ $t('common_cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="confirmLogout"
          >
            {{ $t('common_logout') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const userFullName = computed(() => {
  const firstName = user.value?.firstName;
  const lastName = user.value?.lastName;
  if (!firstName || !lastName) return '';
  return firstName + ' ' + lastName;
});

const headerLinks = [
  { path: '/', label: 'common_home' },
  { path: '/crew', label: 'common_crew' },
];

const route = useRoute();
const showLogoutDialog = ref(false);

const confirmLogout = async () => {
  showLogoutDialog.value = false;
  await authStore.logout();
  authStore.resetInitState();
  navigateTo('/login');
};
</script>

<style scoped lang="scss">
/*
 * Skin tokens — override on an ancestor to recolor this header per-page.
 *   --header-fg     body text, link rest state
 *   --header-accent title, hover/active link state
 */
.header-content {
  --header-fg: #{color(--v-theme-on-surface)};
  --header-accent: #{color(--v-theme-primary)};

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $base-padding;
  color: var(--header-fg);
}

.title {
  color: var(--header-accent);
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

.nav-link,
.user-link {
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  color: inherit;

  &:visited {
    color: inherit;
  }

  &:hover,
  &.active {
    color: var(--header-accent);
  }
}

.user-link {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
