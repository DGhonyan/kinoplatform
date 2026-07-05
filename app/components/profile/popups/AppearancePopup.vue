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

        <div class="hair-field">
          <Select
            v-model="hairPreset"
            color="accent"
            label="appearance_hair_color"
            :placeholder="$t('onboarding_select_placeholder')"
            :items="hairItems"
            :error-messages="errors.hairColor"
            @update:model-value="errors.hairColor = ''"
          />
          <Input
            v-if="hairPreset === CUSTOM"
            v-model="hairCustom"
            color="accent"
            type="text"
            :placeholder="$t('appearance_custom_color_placeholder')"
            :error-messages="errors.hairCustom"
            hide-details="auto"
            @update:model-value="errors.hairCustom = ''"
          />
        </div>

        <div class="row">
          <Select
            v-model="draft.eyeColor"
            color="accent"
            label="appearance_eye_color"
            :placeholder="$t('onboarding_select_placeholder')"
            :items="eyeItems"
            :error-messages="errors.eyeColor"
            @update:model-value="errors.eyeColor = ''"
          />
          <Select
            v-model="draft.skinColor"
            color="accent"
            label="appearance_skin_color"
            :placeholder="$t('onboarding_select_placeholder')"
            :items="skinItems"
            :error-messages="errors.skinColor"
            @update:model-value="errors.skinColor = ''"
          />
        </div>
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
import { HAIR_COLORS, EYE_COLORS, SKIN_COLORS, PHYSICAL_CHARACTERISTICS } from '~/utils/appearance';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
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

const CUSTOM = '__custom__';

const draft = reactive({
  height: props.appearance?.height != null ? String(props.appearance.height) : '',
  weight: props.appearance?.weight != null ? String(props.appearance.weight) : '',
  eyeColor: props.appearance?.eyeColor ?? '',
  skinColor: props.appearance?.skinColor ?? '',
  tattoos: props.appearance?.tattoos ?? false,
  physicalCharacteristics: [...(props.appearance?.physicalCharacteristics ?? [])],
  otherCharacteristic: props.appearance?.otherCharacteristic ?? '',
  clothingSize: props.appearance?.clothingSize ?? '',
  shoeSize: props.appearance?.shoeSize ?? '',
});

// Hair color is a preset id OR a custom string; seed the two controls from it.
const initialHair = props.appearance?.hairColor ?? '';
const isPresetHair = (HAIR_COLORS as readonly string[]).includes(initialHair);
const hairPreset = ref(initialHair ? (isPresetHair ? initialHair : CUSTOM) : '');
const hairCustom = ref(isPresetHair ? '' : initialHair);

const errors = reactive({
  height: '', weight: '', hairColor: '', hairCustom: '', eyeColor: '', skinColor: '',
});

const hairItems = computed(() => [
  ...HAIR_COLORS.map(id => ({ value: id, title: t(id) })),
  { value: CUSTOM, title: t('appearance_custom_color') },
]);
const eyeItems = computed(() => EYE_COLORS.map(id => ({ value: id, title: t(id) })));
const skinItems = computed(() => SKIN_COLORS.map(id => ({ value: id, title: t(id) })));
const characteristicItems = computed(() =>
  PHYSICAL_CHARACTERISTICS.map(id => ({ value: id, title: t(id) })),
);

const done = () => {
  (Object.keys(errors) as (keyof typeof errors)[]).forEach(k => (errors[k] = ''));
  let ok = true;

  const h = Number(draft.height);
  const w = Number(draft.weight);
  if (!draft.height || Number.isNaN(h) || h < 30 || h > 300) {
    errors.height = t('appearance_height_invalid');
    ok = false;
  }
  if (!draft.weight || Number.isNaN(w) || w < 20 || w > 500) {
    errors.weight = t('appearance_weight_invalid');
    ok = false;
  }
  if (!hairPreset.value) {
    errors.hairColor = t('common_this_field_is_required');
    ok = false;
  }
  else if (hairPreset.value === CUSTOM && !hairCustom.value.trim()) {
    errors.hairCustom = t('common_this_field_is_required');
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

  const hairColor = hairPreset.value === CUSTOM ? hairCustom.value.trim() : hairPreset.value;

  emit('save', {
    height: h,
    weight: w,
    hairColor,
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

.hair-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
