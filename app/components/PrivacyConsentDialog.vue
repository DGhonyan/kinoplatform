<template>
  <v-dialog
    :model-value="open"
    max-width="440px"
    persistent
  >
    <v-card rounded="lg">
      <v-card-title class="text-h6 consent-title">
        {{ $t(isUpdate ? 'privacy_consent_title_updated' : 'privacy_consent_title_new') }}
      </v-card-title>
      <v-card-text class="consent-text">
        <i18n-t
          keypath="privacy_consent_body"
          tag="p"
        >
          <template #policy>
            <NuxtLink
              to="/privacy"
              class="link"
            >
              {{ $t('privacy_policy_inline') }}
            </NuxtLink>
          </template>
        </i18n-t>
        <i18n-t
          keypath="privacy_consent_decline_hint"
          tag="p"
          class="muted"
        >
          <template #settings>
            <NuxtLink
              to="/settings"
              class="link"
            >
              {{ $t('common_settings') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <Button
          variant="text"
          color="white"
          :disabled="saving"
          @click="logout"
        >
          {{ $t('common_logout') }}
        </Button>
        <Button
          :loading="saving"
          @click="accept"
        >
          {{ $t('privacy_consent_agree') }}
        </Button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import Button from '~/components/Button.vue';

// Blocks a signed-in user until they accept the current PRIVACY_POLICY_VERSION:
// accounts from before consent was recorded, and everyone after a version bump.
// New sign-ups accept in the registration wizard, so they never see this.
const authStore = useAuthStore();
const accountStore = useAccountStore();
const route = useRoute();

// Still reachable while acceptance is pending: the policy itself, and Settings
// (to download or delete the account instead of agreeing).
const EXEMPT_PATHS = ['/privacy', '/settings'];

const open = computed(() => {
  const user = authStore.user;
  if (!user || user.acceptedPrivacyVersion === PRIVACY_POLICY_VERSION) return false;
  const path = route.path.replace(/\/+$/, '') || '/';
  return !EXEMPT_PATHS.includes(path);
});

// Accepted some earlier version → "updated"; never accepted → "published".
const isUpdate = computed(() => !!authStore.user?.acceptedPrivacyVersion);

const saving = ref(false);

// On success the store swaps in the updated user, which closes the dialog.
const accept = async () => {
  saving.value = true;
  try {
    await accountStore.updateConsent({ acceptedPrivacyVersion: PRIVACY_POLICY_VERSION });
  }
  finally {
    saving.value = false;
  }
};

const logout = async () => {
  await authStore.logout();
  authStore.resetInitState();
  navigateTo('/login');
};
</script>

<style scoped lang="scss">
.consent-title {
  white-space: normal;
}

.consent-text {
  display: flex;
  flex-direction: column;
  gap: 12px;

  p {
    margin: 0;
    line-height: 1.5;
  }
}

.muted {
  opacity: 0.7;
}

.link {
  color: color(--v-theme-primary);
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
