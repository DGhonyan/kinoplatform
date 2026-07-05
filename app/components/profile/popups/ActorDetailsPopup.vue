<template>
  <PopupShell
    v-model="open"
    :title="$t('actor_details_title')"
    :description="$t('actor_details_description')"
    persistent
  >
    <ActorDetailsFields
      v-model:photos="additionalPhotos"
      v-model:appearance="appearance"
      :photos-error="photosError"
      :appearance-error="appearanceError"
    />

    <template #actions>
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
 * Forced when a user adds an acting role after onboarding and still lacks the
 * mandatory appearance/photos (see `needsActorDetails`). Persistent — the only
 * exit is completing the fields.
 */
const open = defineModel<boolean>({ required: true });

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
