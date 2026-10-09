<template>
  <!-- Trusted HTML: rendered from our own Markdown files, never from user input. -->
  <!-- eslint-disable vue/no-v-html -->
  <article
    class="privacy-page"
    v-html="html"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup lang="ts">
import { marked } from 'marked';
import privacyEn from '~/legal/privacy.en.md?raw';
import privacyHy from '~/legal/privacy.hy.md?raw';

// Public page (see auth.global.ts) — the policy must be readable before signing up.
// The text is one Markdown file per locale in app/legal/; edit those, then bump
// PRIVACY_POLICY_VERSION (utils/privacy.ts) if the change is material.
const sources: Record<string, string> = { en: privacyEn, hy: privacyHy };

const { locale } = useI18n();

// `breaks`: a single newline is a line break, so the files render as they read.
const html = computed(() =>
  marked(sources[locale.value] ?? privacyEn, { async: false, breaks: true }),
);
</script>

<style lang="scss" scoped>
.privacy-page {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;

  :deep(h1) {
    font-size: 32px;
    font-weight: 600;
  }

  :deep(h2) {
    font-size: 20px;
    font-weight: 600;
    margin-top: 16px;
  }

  :deep(p),
  :deep(li) {
    font-size: 16px;
    line-height: 1.6;
    opacity: 0.85;
    margin: 0;
  }

  :deep(ul) {
    margin: 0;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  :deep(a) {
    color: color(--v-theme-on-surface);
  }
}
</style>
