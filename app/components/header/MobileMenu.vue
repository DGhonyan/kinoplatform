<template>
  <!-- Collapsed nav: a hamburger in the right-hand actions area that opens an
       in-place dropdown anchored under it (no sidebar/drawer). -->
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        class="hamburger"
        v-bind="menuProps"
        :aria-label="$t('common_menu')"
      >
        <v-icon icon="mdi-menu" />
      </button>
    </template>

    <v-list
      density="compact"
      min-width="210"
    >
      <v-list-item
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        :title="$t(link.label)"
        :active="route.path === link.path"
      />

      <v-divider class="my-1" />

      <template v-if="authed">
        <HeaderAccountLinks @logout="emit('logout')" />
      </template>
      <!-- `to` (not @click) so it renders as a real anchor: middle-click,
           open-in-new-tab and copy-link all work, like every sibling row. -->
      <v-list-item
        v-else
        :to="isOnLogin ? '/register' : '/login'"
        prepend-icon="mdi-login"
        :title="$t(isOnLogin ? 'common_register' : 'common_login')"
      />

      <v-divider class="my-1" />

      <v-list-subheader>{{ $t('settings_language') }}</v-list-subheader>
      <LanguageLinks />
    </v-list>
  </v-menu>
</template>

<script lang="ts" setup>
import HeaderAccountLinks from './AccountLinks.vue';
import LanguageLinks from '~/components/LanguageLinks.vue';

defineProps<{
  // Already filtered to what this viewer may see; the menu just renders them.
  // (Inlined shape sidesteps the SFC compiler's flaky `~~/`-import resolution.)
  links: { path: string; label: string }[];
  authed: boolean;
  isOnLogin: boolean;
}>();

const emit = defineEmits<{ logout: [] }>();

const route = useRoute();
</script>

<style scoped lang="scss">
.hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  // Inherits the header's --header-fg (defined on the ancestor .header-content).
  color: var(--header-fg);
  font-size: 26px;

  &:hover {
    opacity: 0.85;
  }
}
</style>
