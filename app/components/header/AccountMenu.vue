<template>
  <!-- Logged-in avatar + dropdown for the expanded top bar. -->
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        class="profile-trigger"
        v-bind="menuProps"
        :aria-label="$t('common_account_menu')"
      >
        <v-icon
          icon="custom:profile"
          class="profile-avatar-icon"
        />
        <v-icon
          icon="mdi-chevron-down"
          class="profile-chevron"
        />
      </button>
    </template>

    <v-list
      density="compact"
      min-width="180"
    >
      <HeaderAccountLinks @logout="emit('logout')" />
    </v-list>
  </v-menu>
</template>

<script lang="ts" setup>
import HeaderAccountLinks from './AccountLinks.vue';

const emit = defineEmits<{ logout: [] }>();
</script>

<style scoped lang="scss">
.profile-trigger {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: none;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  // Inherits the header's --header-fg (defined on the ancestor .header-content).
  color: var(--header-fg);

  &:hover {
    opacity: 0.85;
  }
}

// v-icon sizes off font-size; the chevron is deliberately smaller than the icon.
.profile-avatar-icon {
  font-size: 30px;
}

.profile-chevron {
  font-size: 18px;
}
</style>
