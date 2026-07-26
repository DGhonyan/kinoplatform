<template>
  <!-- Multi-root fragment: renders straight into whichever <v-list> hosts it
       (the top-bar dropdown and the mobile drawer both reuse these rows). -->
  <v-list-item
    to="/user"
    prepend-icon="mdi-account-outline"
    :title="$t('common_my_profile')"
  />
  <v-list-item
    to="/settings"
    prepend-icon="mdi-cog-outline"
    :title="$t('common_settings')"
  />
  <v-list-item
    prepend-icon="mdi-logout"
    :title="$t('common_logout')"
    @click="emit('logout')"
  />
</template>

<script lang="ts" setup>
const emit = defineEmits<{ logout: [] }>();
</script>
