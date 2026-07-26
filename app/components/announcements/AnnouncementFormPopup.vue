<template>
  <PopupShell
    v-model="open"
    :title="$t('announcement_post_title')"
    :description="$t('announcement_post_hint')"
    :max-width="520"
    @submit="submit"
  >
    <Select
      v-model="form.category"
      color="primary"
      label="announcement_field_category"
      :placeholder="$t('announcement_select_category')"
      :items="categoryItems"
      required
      :error-messages="errors.category"
      @update:model-value="errors.category = ''"
    />
    <Input
      v-model="form.title"
      color="primary"
      type="text"
      label="announcement_field_title"
      :maxlength="120"
      required
      hide-details="auto"
      :error-messages="errors.title"
      @update:model-value="errors.title = ''"
    />
    <TextArea
      v-model="form.description"
      color="primary"
      label="announcement_field_description"
      :placeholder="$t('announcement_description_hint')"
      :maxlength="300"
      :counter="300"
      :rows="2"
      auto-grow
      hide-details="auto"
    />
    <TextArea
      v-model="form.body"
      color="primary"
      label="announcement_field_body"
      :placeholder="$t('announcement_body_hint')"
      :maxlength="5000"
      :counter="5000"
      :rows="4"
      auto-grow
      hide-details="auto"
    />
    <div class="row">
      <!-- Labelled so it lines up with the Select beside it. -->
      <DateInput
        v-model="form.deadline"
        :min="todayIso"
        label="announcement_field_deadline"
        hide-details="auto"
        prepend-icon="mdi-clock-outline"
      />
      <Select
        v-model="form.ctaType"
        color="primary"
        label="announcement_field_cta"
        :items="ctaItems"
      />
    </div>
    <!-- `type="text"`, not "url": PopupShell submits via a real <form>, and
         native url validation rejects the bare domain ("kinofest.am") that
         normalizeLink exists to accept — Enter would silently fail while the
         Submit button, which sits outside the form, worked. We validate with
         safeExternalUrl instead. -->
    <Input
      v-model="form.link"
      color="primary"
      type="text"
      inputmode="url"
      label="announcement_field_link"
      :placeholder="$t('announcement_link_hint')"
      prepend-inner-icon="mdi-link-variant"
      hide-details="auto"
      :error-messages="errors.link"
      @update:model-value="errors.link = ''"
    />

    <template #actions>
      <Button
        variant="secondary"
        color="white"
        size="large"
        :disabled="busy"
        @click="open = false"
      >
        {{ $t('common_cancel') }}
      </Button>
      <Button
        color="primary"
        size="large"
        :loading="busy"
        @click="submit"
      >
        {{ $t('announcement_submit') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import type { AnnouncementInput, AnnouncementCategory, AnnouncementCtaType } from '~~/shared/types/announcement';
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_CTA_TYPES, ADMIN_ONLY_CATEGORIES } from '~~/shared/types/announcement';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import Input from '~/components/Input.vue';
import Select from '~/components/Select.vue';
import TextArea from '~/components/TextArea.vue';
import DateInput from '~/components/DateInput.vue';
import Button from '~/components/Button.vue';
import { safeExternalUrl } from '~/utils/safeUrl';
import { todayLocalDate } from '~/utils/dates';

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{ created: [] }>();

const { t } = useI18n();
const authStore = useAuthStore();
const announcementStore = useAnnouncementStore();

const isAdmin = computed(() => authStore.user?.type === 'admin');
const todayIso = todayLocalDate();

const { form, errors, busy } = usePopupForm(
  open,
  () => ({ category: '', title: '', description: '', body: '', deadline: '', link: '', ctaType: 'read_more' }),
  () => ({ category: '', title: '', link: '' }),
);

const categoryItems = computed(() =>
  ANNOUNCEMENT_CATEGORIES
    .filter(c => !ADMIN_ONLY_CATEGORIES.includes(c) || isAdmin.value)
    .map(c => ({ value: c, title: t(`announcement_category_${c}`) })),
);
const ctaItems = computed(() =>
  ANNOUNCEMENT_CTA_TYPES.map(c => ({ value: c, title: t(`announcement_cta_${c}`) })),
);

// Accept a bare domain by assuming https; validate with the same guard the card
// uses to render the link (safeExternalUrl → null when unsafe).
const normalizeLink = (raw: string) =>
  raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;

const validate = (): boolean => {
  errors.category = errors.title = errors.link = '';
  let ok = true;

  if (!form.category) {
    errors.category = t('common_this_field_is_required');
    ok = false;
  }
  if (!form.title.trim()) {
    errors.title = t('common_this_field_is_required');
    ok = false;
  }
  const link = form.link.trim();
  if (link && !safeExternalUrl(normalizeLink(link))) {
    errors.link = t('announcement_invalid_link');
    ok = false;
  }

  return ok;
};

const submit = async () => {
  if (busy.value || !validate()) return;

  const link = form.link.trim();
  const payload: AnnouncementInput = {
    category: form.category as AnnouncementCategory,
    title: form.title.trim(),
    ctaType: form.ctaType as AnnouncementCtaType,
  };
  if (form.description.trim()) payload.description = form.description.trim();
  if (form.body.trim()) payload.body = form.body.trim();
  if (form.deadline) payload.deadline = form.deadline;
  if (link) payload.link = normalizeLink(link);

  busy.value = true;
  try {
    const data = await announcementStore.createAnnouncement(payload);
    if (!data) return;

    open.value = false;
    emit('created');
  }
  finally {
    busy.value = false;
  }
};
</script>

<style scoped lang="scss">
.row {
  display: flex;
  gap: 12px;
  // Bottom-align, so the two fields line up even when one label wraps to a
  // second line (the Armenian deadline label does, in a half-width column).
  align-items: flex-end;

  > * {
    flex: 1;
  }

  // Two-up leaves ~146px per field in a 360px dialog, which clips the formatted
  // date and the CTA option titles. Stack them, like every other popup row.
  @include mobile {
    flex-direction: column;
  }
}
</style>
