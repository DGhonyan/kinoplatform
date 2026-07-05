<template>
  <PopupShell
    v-model="open"
    :title="$t(title)"
    :description="$t(description)"
    :persistent="!dismissable"
  >
    <ActorDetailsFields
      v-model:photos="additionalPhotos"
      v-model:appearance="appearance"
      :photos-error="photosError"
      :appearance-error="appearanceError"
    />

    <template #actions>
      <Button
        v-if="dismissable"
        variant="secondary"
        color="accent"
        size="large"
        :disabled="saving"
        @click="open = false"
      >
        {{ $t('common_cancel') }}
      </Button>
      <Button
        size="large"
        :loading="saving"
        @click="save"
      >
        {{ $t('common_save') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import type { Appearance } from '~~/shared/types/user';
import { isAppearanceComplete, hasRequiredActorPhotos } from '~/utils/appearance';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import ActorDetailsFields from '~/components/profile/popups/ActorDetailsFields.vue';
import Button from '~/components/Button.vue';

/**
 * Two modes:
 *  - forced (default) — persistent, only a Save button. Used when a user adds an
 *    acting role after onboarding and still lacks the mandatory details (see
 *    `needsActorDetails`); the only exit is completing them.
 *  - dismissable — a cancelable editor. Photos and appearance are displayed in
 *    separate places on the profile, but both edit affordances open this one
 *    popup so the owner manages them together.
 */
const open = defineModel<boolean>({ required: true });

withDefaults(defineProps<{
  dismissable?: boolean;
  title?: string;
  description?: string;
}>(), {
  dismissable: false,
  title: 'actor_details_title',
  description: 'actor_details_description',
});

const emit = defineEmits<{ completed: [] }>();

const { t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();

const additionalPhotos = ref<string[]>([...(authStore.user?.additionalPhotos ?? [])]);
const appearance = ref<Appearance | null>(authStore.user?.appearance ?? null);
const photosError = ref('');
const appearanceError = ref('');
const saving = ref(false);

const validate = (): boolean => {
  photosError.value = '';
  appearanceError.value = '';
  let ok = true;

  if (!hasRequiredActorPhotos(additionalPhotos.value)) {
    photosError.value = t('actor_photos_min_error');
    ok = false;
  }
  if (!isAppearanceComplete(appearance.value)) {
    appearanceError.value = t('appearance_incomplete_error');
    ok = false;
  }

  return ok;
};

const save = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    const data = await userStore.updateUser({
      appearance: appearance.value ?? undefined,
      additionalPhotos: additionalPhotos.value,
    });
    if (!data) return;

    open.value = false;
    emit('completed');
  }
  finally {
    saving.value = false;
  }
};
</script>
