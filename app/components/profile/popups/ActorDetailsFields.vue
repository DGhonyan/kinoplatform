<template>
  <FieldCard
    icon="custom:camera-add"
    title="actor_photos_title"
    description="actor_photos_description"
    required
    :error="photosError"
  >
    <MultiImageUpload v-model="photos" />
  </FieldCard>

  <FieldCard
    icon="custom:form"
    title="appearance_title"
    description="appearance_description"
    required
    :error="appearanceError"
  >
    <Button
      variant="secondary"
      color="accent"
      size="small"
      @click="appearanceOpen = true"
    >
      {{ appearanceComplete ? $t('appearance_edit') : $t('appearance_add') }}
    </Button>
  </FieldCard>

  <AppearancePopup
    v-if="appearanceOpen"
    v-model="appearanceOpen"
    :appearance="appearance"
    @save="onAppearanceSaved"
  />
</template>

<script lang="ts" setup>
import type { Appearance } from '~~/shared/types/user';
import { isAppearanceComplete } from '~/utils/appearance';
import FieldCard from '~/components/profile/popups/FieldCard.vue';
import MultiImageUpload from '~/components/MultiImageUpload.vue';
import AppearancePopup from '~/components/profile/popups/AppearancePopup.vue';
import Button from '~/components/Button.vue';

/**
 * The two actor-only inputs — additional photos + appearance — shared by the
 * onboarding EssentialsPopup and the standalone ActorDetailsPopup (forced when a
 * user adds an acting role post-onboarding). Owns the appearance sub-popup; the
 * parent owns persistence and the validation error strings.
 */
const photos = defineModel<string[]>('photos', { required: true });
const appearance = defineModel<Appearance | null>('appearance', { required: true });

defineProps<{
  photosError?: string;
  appearanceError?: string;
}>();

const appearanceOpen = ref(false);
const appearanceComplete = computed(() => isAppearanceComplete(appearance.value));

const onAppearanceSaved = (a: Appearance) => {
  appearance.value = a;
};
</script>
