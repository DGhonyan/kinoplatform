<template>
  <div class="settings-page">
    <h1 class="settings-title">
      {{ $t('common_settings') }}
    </h1>

    <section class="settings-section">
      <div class="settings-row">
        <span class="settings-label">{{ $t('settings_language') }}</span>
        <LanguageSelector />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
// Auth-gated by middleware (settings is not in the public-paths allowlist).
// Uses the default layout. LanguageSelector is auto-imported.
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
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 14px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.settings-label {
  font-size: 15px;
  font-weight: 500;
}
</style>
