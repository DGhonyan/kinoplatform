<template>
  <PopupShell
    v-model="open"
    :title="$t('appearance_title')"
    :description="$t('appearance_description')"
    :max-width="640"
  >
    <div class="appearance-form">
      <!-- ── Mandatory ── -->
      <section class="group">
        <h3 class="group-title">
          {{ $t('appearance_mandatory') }}
        </h3>

        <div class="row">
          <Input
            v-model="draft.height"
            color="accent"
            type="number"
            label="appearance_height"
            :error-messages="errors.height"
            hide-details="auto"
            @update:model-value="errors.height = ''"
          />
          <Input
            v-model="draft.weight"
            color="accent"
            type="number"
            label="appearance_weight"
            :error-messages="errors.weight"
            hide-details="auto"
            @update:model-value="errors.weight = ''"
          />
        </div>

        <ColorSwatchGroup
          v-model="draft.hairColor"
          :colors="HAIR_COLORS"
          label="appearance_hair_color"
          required
          custom
          :error="errors.hairColor"
          @update:model-value="errors.hairColor = ''"
        />

        <ColorSwatchGroup
          v-model="draft.eyeColor"
          :colors="EYE_COLORS"
          label="appearance_eye_color"
          required
          :error="errors.eyeColor"
          @update:model-value="errors.eyeColor = ''"
        />

        <ColorSwatchGroup
          v-model="draft.skinColor"
          :colors="SKIN_COLORS"
          label="appearance_skin_color"
          required
          :error="errors.skinColor"
          @update:model-value="errors.skinColor = ''"
        />
      </section>

      <!-- ── Optional ── -->
      <section class="group">
        <h3 class="group-title">
          {{ $t('appearance_optional') }}
        </h3>

        <div class="subgroup">
          <span class="subgroup-title">{{ $t('appearance_additional') }}</span>
          <v-checkbox
            v-model="draft.tattoos"
            color="accent"
            density="compact"
            hide-details
            :label="$t('appearance_tattoos')"
          />
        </div>

        <div class="subgroup">
          <span class="subgroup-title">{{ $t('appearance_characteristics') }}</span>
          <Select
            v-model="draft.physicalCharacteristics"
            color="accent"
            multiple
            :items="characteristicItems"
            :placeholder="$t('onboarding_select_placeholder')"
            hide-details="auto"
          />
          <Input
            v-model="draft.otherCharacteristic"
            color="accent"
            type="text"
            :placeholder="$t('appearance_other_placeholder')"
            hide-details="auto"
          />
        </div>

        <div class="subgroup">
          <span class="subgroup-title">{{ $t('appearance_clothing') }}</span>
          <div class="row">
            <Input
              v-model="draft.clothingSize"
              color="accent"
              type="text"
              label="appearance_clothing_size"
              hide-details="auto"
            />
            <Input
              v-model="draft.shoeSize"
              color="accent"
              type="text"
              label="appearance_shoe_size"
              hide-details="auto"
            />
          </div>
        </div>
      </section>
    </div>

    <template #actions>
      <Button
        variant="secondary"
        color="accent"
        size="large"
        @click="open = false"
      >
        {{ $t('common_cancel') }}
      </Button>
      <Button
        color="accent"
        size="large"
        @click="done"
      >
        {{ $t('common_done') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import type { Appearance } from '~~/shared/types/user';
import {
  HAIR_COLORS,
  EYE_COLORS,
  SKIN_COLORS,
  PHYSICAL_CHARACTERISTICS,
  HEIGHT_RANGE,
  WEIGHT_RANGE,
} from '~/utils/appearance';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import ColorSwatchGroup from '~/components/profile/popups/ColorSwatchGroup.vue';
import Select from '~/components/Select.vue';
import Button from '~/components/Button.vue';

/**
 * Actor appearance editor. Mandatory (height/weight/hair/eye/skin) are validated
 * on Done; optional fields flow through untouched. Emits the built Appearance
 * back to the parent, which owns persistence (essentials save / profile edit).
 */
const open = defineModel<boolean>({ required: true });

const props = defineProps<{
  appearance: Appearance | null;
}>();

const emit = defineEmits<{
  save: [appearance: Appearance];
}>();

const { t } = useI18n();

const draft = reactive({
  height: props.appearance?.height != null ? String(props.appearance.height) : '',
  weight: props.appearance?.weight != null ? String(props.appearance.weight) : '',
  hairColor: props.appearance?.hairColor ?? '',
  eyeColor: props.appearance?.eyeColor ?? '',
  skinColor: props.appearance?.skinColor ?? '',
  tattoos: props.appearance?.tattoos ?? false,
  physicalCharacteristics: [...(props.appearance?.physicalCharacteristics ?? [])],
  otherCharacteristic: props.appearance?.otherCharacteristic ?? '',
  clothingSize: props.appearance?.clothingSize ?? '',
  shoeSize: props.appearance?.shoeSize ?? '',
});

const errors = reactive({
  height: '', weight: '', hairColor: '', eyeColor: '', skinColor: '',
});

const characteristicItems = computed(() =>
  PHYSICAL_CHARACTERISTICS.map(id => ({ value: id, title: t(id) })),
);

const done = () => {
  (Object.keys(errors) as (keyof typeof errors)[]).forEach(k => (errors[k] = ''));
  let ok = true;

  const h = Number(draft.height);
  const w = Number(draft.weight);
  if (!draft.height || Number.isNaN(h) || h < HEIGHT_RANGE.min || h > HEIGHT_RANGE.max) {
    errors.height = t('appearance_height_invalid');
    ok = false;
  }
  if (!draft.weight || Number.isNaN(w) || w < WEIGHT_RANGE.min || w > WEIGHT_RANGE.max) {
    errors.weight = t('appearance_weight_invalid');
    ok = false;
  }
  if (!draft.hairColor) {
    errors.hairColor = t('common_this_field_is_required');
    ok = false;
  }
  if (!draft.eyeColor) {
    errors.eyeColor = t('common_this_field_is_required');
    ok = false;
  }
  if (!draft.skinColor) {
    errors.skinColor = t('common_this_field_is_required');
    ok = false;
  }
  if (!ok) return;

  emit('save', {
    height: h,
    weight: w,
    hairColor: draft.hairColor,
    eyeColor: draft.eyeColor,
    skinColor: draft.skinColor,
    tattoos: draft.tattoos,
    ...(draft.physicalCharacteristics.length ? { physicalCharacteristics: draft.physicalCharacteristics } : {}),
    ...(draft.otherCharacteristic.trim() ? { otherCharacteristic: draft.otherCharacteristic.trim() } : {}),
    ...(draft.clothingSize.trim() ? { clothingSize: draft.clothingSize.trim() } : {}),
    ...(draft.shoeSize.trim() ? { shoeSize: draft.shoeSize.trim() } : {}),
  });
  open.value = false;
};
</script>

<style scoped lang="scss">
.appearance-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid color(--v-theme-accent, 0.4);
}

.row {
  display: flex;
  gap: 12px;

  > * {
    flex: 1;
  }
}

.subgroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subgroup-title {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
}
</style>
