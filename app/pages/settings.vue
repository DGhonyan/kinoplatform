<template>
  <div class="settings-page">
    <h1 class="settings-title">
      {{ $t('common_settings') }}
    </h1>

    <!-- Preferences -->
    <section class="settings-section">
      <div class="settings-row">
        <span class="settings-label">{{ $t('settings_language') }}</span>
        <LanguageSelector />
      </div>
    </section>

    <!-- Account -->
    <section class="settings-section">
      <h2 class="section-title">
        {{ $t('settings_account') }}
      </h2>

      <div class="settings-row">
        <div class="row-text">
          <span class="settings-label">{{ $t('common_email') }}</span>
          <span class="row-value">{{ email }}</span>
        </div>
        <Button
          variant="secondary"
          color="white"
          size="small"
          @click="emailOpen = true"
        >
          {{ $t('common_change') }}
        </Button>
      </div>

      <div class="settings-row">
        <div class="row-text">
          <span class="settings-label">{{ $t('common_password') }}</span>
          <span class="row-value">••••••••</span>
        </div>
        <Button
          variant="secondary"
          color="white"
          size="small"
          @click="passwordOpen = true"
        >
          {{ $t('settings_change_password') }}
        </Button>
      </div>
    </section>

    <!-- Active sessions -->
    <section class="settings-section">
      <h2 class="section-title">
        {{ $t('settings_active_sessions') }}
      </h2>
      <SettingsSessions />
    </section>

    <!-- Privacy -->
    <section class="settings-section">
      <h2 class="section-title">
        {{ $t('settings_privacy') }}
      </h2>
      <div class="settings-row">
        <div class="row-text">
          <span class="settings-label">{{ $t('common_privacy_policy') }}</span>
          <span class="row-value muted">{{ privacyStatus }}</span>
        </div>
        <Button
          variant="secondary"
          color="white"
          size="small"
          to="/privacy"
        >
          {{ $t('settings_view') }}
        </Button>
      </div>
      <div class="settings-row">
        <div class="row-text">
          <span class="settings-label">{{ $t('settings_marketing_emails') }}</span>
          <span class="row-value muted">{{ $t('settings_marketing_emails_hint') }}</span>
        </div>
        <v-switch
          :model-value="marketingConsent"
          :loading="savingMarketing"
          :disabled="savingMarketing"
          color="primary"
          density="compact"
          hide-details
          inset
          class="flex-grow-0"
          @update:model-value="setMarketingConsent"
        />
      </div>
    </section>

    <!-- Your data -->
    <section class="settings-section">
      <h2 class="section-title">
        {{ $t('settings_your_data') }}
      </h2>
      <div class="settings-row">
        <div class="row-text">
          <span class="settings-label">{{ $t('settings_export_data') }}</span>
          <span class="row-value muted">{{ $t('settings_export_data_hint') }}</span>
        </div>
        <Button
          variant="secondary"
          color="white"
          size="small"
          :loading="exporting"
          @click="exportData"
        >
          {{ $t('settings_export') }}
        </Button>
      </div>
    </section>

    <!-- Danger zone -->
    <section class="settings-section danger">
      <div class="settings-row">
        <div class="row-text">
          <span class="settings-label">{{ $t('settings_delete_account') }}</span>
          <span class="row-value muted">{{ $t('settings_delete_account_hint') }}</span>
        </div>
        <Button
          color="error"
          size="small"
          @click="deleteOpen = true"
        >
          {{ $t('settings_delete_account') }}
        </Button>
      </div>
    </section>

    <SettingsChangeEmailPopup v-model="emailOpen" />
    <SettingsChangePasswordPopup v-model="passwordOpen" />
    <SettingsDeleteAccountPopup v-model="deleteOpen" />
  </div>
</template>

<script lang="ts" setup>
// Auth-gated by middleware (not in the public-paths allowlist).
const authStore = useAuthStore();
const accountStore = useAccountStore();

const email = computed(() => authStore.user?.email ?? '');

const { t, locale } = useI18n();

// "Accepted on …" only for the CURRENT version — an older acceptance means the
// consent dialog is still waiting (it stays hidden on this page).
const privacyStatus = computed(() => {
  const user = authStore.user;
  if (user?.acceptedPrivacyVersion !== PRIVACY_POLICY_VERSION || !user.privacyAcceptedAt) {
    return t('settings_privacy_not_accepted');
  }
  return t('settings_privacy_accepted_on', { date: formatDate(user.privacyAcceptedAt, locale.value) });
});

// Bound one-way to the store: on a failed save the user is unchanged, so the
// switch flips back by itself.
const marketingConsent = computed(() => authStore.user?.marketingConsent ?? false);
const savingMarketing = ref(false);

const setMarketingConsent = async (value: boolean | null) => {
  savingMarketing.value = true;
  try {
    await accountStore.updateConsent({ marketingConsent: !!value });
  }
  finally {
    savingMarketing.value = false;
  }
};

const emailOpen = ref(false);
const passwordOpen = ref(false);
const deleteOpen = ref(false);
const exporting = ref(false);

const exportData = async () => {
  exporting.value = true;
  try {
    const data = await accountStore.exportData();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'kinoplatform-data.json';
    anchor.click();
    // Defer revoke to the next tick — revoking in the same frame as click() can
    // abort the download before the browser opens the blob stream (Firefox).
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  finally {
    exporting.value = false;
  }
};
</script>

<style scoped lang="scss">
.settings-page {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-title {
  font-size: 28px;
  font-weight: 600;
}

.settings-section {
  padding: 20px;
  border: 1px solid color(--v-theme-on-surface, 0.12);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &.danger {
    border-color: color(--v-theme-error, 0.4);
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.row-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.settings-label {
  font-size: 15px;
  font-weight: 500;
}

.row-value {
  font-size: 13px;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.muted {
    white-space: normal;
  }
}
</style>
