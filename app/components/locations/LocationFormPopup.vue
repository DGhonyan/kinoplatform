<template>
  <PopupShell
    v-model="open"
    :title="$t(isEdit ? 'location_form_edit_title' : 'location_form_create_title')"
    :description="$t('location_form_hint')"
    :max-width="720"
    @submit="submit"
  >
    <!-- ── Basics ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('location_form_section_basics') }}
      </h3>

      <Input
        v-model="form.title"
        color="primary"
        type="text"
        label="location_form_field_title"
        :maxlength="140"
        required
        hide-details="auto"
        :error-messages="errors.title"
        @update:model-value="errors.title = ''"
      />

      <div class="row">
        <Input
          v-model="form.city"
          color="primary"
          type="text"
          label="locations_filter_city"
          :maxlength="80"
          hide-details="auto"
        />
        <Input
          v-model="form.country"
          color="primary"
          type="text"
          label="location_form_field_country"
          :maxlength="80"
          hide-details="auto"
        />
      </div>

      <Input
        v-model="form.address"
        color="primary"
        type="text"
        label="location_form_field_address"
        :maxlength="200"
        hide-details="auto"
      />

      <div class="row">
        <Input
          v-model="form.pricePerNight"
          color="primary"
          type="number"
          min="0"
          step="1000"
          label="locations_filter_price"
          required
          hide-details="auto"
          :error-messages="errors.pricePerNight"
          @update:model-value="errors.pricePerNight = ''"
        />
        <Input
          v-model="form.currency"
          color="primary"
          type="text"
          label="location_form_field_currency"
          :maxlength="8"
          hide-details="auto"
        />
      </div>
    </section>

    <!-- ── Map ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('location_form_section_map') }}
      </h3>

      <div class="row">
        <Input
          v-model="form.lat"
          color="primary"
          type="number"
          step="any"
          label="location_form_field_lat"
          placeholder="40.7406"
          hide-details="auto"
          :error-messages="errors.lat"
          @update:model-value="errors.lat = ''"
        />
        <Input
          v-model="form.lng"
          color="primary"
          type="number"
          step="any"
          label="location_form_field_lng"
          placeholder="44.8626"
          hide-details="auto"
          :error-messages="errors.lng"
          @update:model-value="errors.lng = ''"
        />
      </div>
    </section>

    <!-- ── Specs ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('location_form_section_specs') }}
      </h3>

      <div class="row">
        <Input
          v-model="form.houseArea"
          color="primary"
          type="number"
          min="0"
          step="1"
          label="location_house_area"
          suffix="m²"
          hide-details="auto"
        />
        <Input
          v-model="form.landArea"
          color="primary"
          type="number"
          min="0"
          step="1"
          label="location_land_area"
          suffix="m²"
          hide-details="auto"
        />
      </div>

      <div class="row">
        <Input
          v-model="form.floors"
          color="primary"
          type="number"
          min="0"
          step="1"
          label="location_floors"
          hide-details="auto"
        />
        <Input
          v-model="form.rooms"
          color="primary"
          type="number"
          min="0"
          step="1"
          label="location_rooms"
          hide-details="auto"
        />
      </div>

      <div class="row">
        <Input
          v-model="form.bathrooms"
          color="primary"
          type="number"
          min="0"
          step="1"
          label="location_bathrooms"
          hide-details="auto"
        />
        <Input
          v-model="form.maxCrew"
          color="primary"
          type="number"
          min="1"
          step="1"
          label="locations_filter_crew"
          hide-details="auto"
          :error-messages="errors.maxCrew"
          @update:model-value="errors.maxCrew = ''"
        />
      </div>

      <Select
        v-model="form.buildingType"
        color="primary"
        label="location_building_type"
        :items="buildingTypeItems"
        clearable
      />
    </section>

    <!-- ── Description ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('location_description') }}
      </h3>
      <TextArea
        v-model="form.description"
        color="primary"
        :maxlength="5000"
        :counter="5000"
        :rows="4"
        auto-grow
        hide-details="auto"
      />
    </section>

    <!-- ── Amenities ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('locations_filter_amenities') }}
      </h3>
      <Select
        v-model="form.amenities"
        color="primary"
        :items="amenityItems"
        :aria-label="$t('locations_filter_amenities')"
        multiple
        :max-visible-chips="4"
      />
    </section>

    <!-- ── Stay rules ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('location_form_section_stay_rules') }}
      </h3>

      <TextArea
        v-model="form.cancellationPolicy"
        color="primary"
        label="location_cancellation_policy"
        :maxlength="1000"
        :rows="2"
        auto-grow
        hide-details="auto"
      />

      <!-- `type="time"` so the browser itself produces the HH:mm the backend
           regex demands; validate() still checks it for the text fallback. -->
      <div class="row">
        <Input
          v-model="form.checkInAfter"
          color="primary"
          type="time"
          label="location_form_field_check_in_after"
          hide-details="auto"
          :error-messages="errors.checkInAfter"
          @update:model-value="errors.checkInAfter = ''"
        />
        <Input
          v-model="form.checkoutBefore"
          color="primary"
          type="time"
          label="location_form_field_checkout_before"
          hide-details="auto"
          :error-messages="errors.checkoutBefore"
          @update:model-value="errors.checkoutBefore = ''"
        />
      </div>
    </section>

    <!-- ── Safety ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('location_safety_and_property') }}
      </h3>
      <Select
        v-model="form.safety"
        color="primary"
        :items="safetyItems"
        :aria-label="$t('location_safety_and_property')"
        multiple
        :max-visible-chips="4"
      />
    </section>

    <!-- ── Photos ── -->
    <section class="section">
      <h3 class="section-title">
        {{ $t('location_form_section_photos') }}
      </h3>
      <!-- `:aspect-ratio="null"` skips the crop dialog entirely. A location is
           shot in whatever framing the space needs — a wide room, a tall
           stairwell — so locking it to the actor portrait ratio would crop away
           the subject. The card and gallery `contain` it instead. -->
      <MultiImageUpload
        v-model="form.images"
        kind="location_photo"
        :aspect-ratio="null"
        :min="0"
        :max="10"
      />
    </section>

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
        {{ $t('common_save') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import type {
  LocationAmenity,
  LocationBuildingType,
  LocationDetail,
  LocationInput,
  LocationSafety,
} from '~~/shared/types/location';
import {
  LOCATION_AMENITIES,
  LOCATION_BUILDING_TYPES,
  LOCATION_SAFETY,
} from '~~/shared/types/location';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import Input from '~/components/Input.vue';
import Select from '~/components/Select.vue';
import TextArea from '~/components/TextArea.vue';
import Button from '~/components/Button.vue';
import MultiImageUpload from '~/components/MultiImageUpload.vue';

/**
 * Admin create/edit form for a catalogue listing. One component covers both:
 * `location` present means edit (prefilled, PATCH), absent means create (POST).
 *
 * Every numeric field lives in state as a STRING. That's what keeps "" (blank)
 * distinguishable from "0" all the way to the payload — a numeric ref would
 * collapse both to 0 and stamp "Number of floors: 0" onto the detail page.
 */
const open = defineModel<boolean>({ required: true });

const props = withDefaults(
  defineProps<{ location?: LocationDetail | null }>(),
  { location: null },
);

const emit = defineEmits<{ saved: [] }>();

const { t } = useI18n();
const locationStore = useLocationStore();

const isEdit = computed(() => !!props.location);

type FormState = {
  title: string;
  city: string;
  country: string;
  address: string;
  pricePerNight: string;
  currency: string;
  lat: string;
  lng: string;
  houseArea: string;
  landArea: string;
  floors: string;
  rooms: string;
  bathrooms: string;
  maxCrew: string;
  // `null` is what Select's `clearable` writes back — never '' once cleared.
  buildingType: string;
  description: string;
  amenities: LocationAmenity[];
  cancellationPolicy: string;
  checkInAfter: string;
  checkoutBefore: string;
  safety: LocationSafety[];
  images: string[];
};

/** A nullable spec renders as an empty field, not "0". */
const numStr = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

const toForm = (location: LocationDetail | null): FormState => ({
  title: location?.title ?? '',
  city: location?.city ?? '',
  country: location?.country ?? '',
  address: location?.address ?? '',
  pricePerNight: numStr(location?.pricePerNight),
  // The backend defaults new listings to AMD; mirror it so the field is never
  // submitted blank on create.
  currency: location?.currency || 'AMD',
  lat: numStr(location?.lat),
  lng: numStr(location?.lng),
  houseArea: numStr(location?.houseArea),
  landArea: numStr(location?.landArea),
  floors: numStr(location?.floors),
  rooms: numStr(location?.rooms),
  bathrooms: numStr(location?.bathrooms),
  maxCrew: numStr(location?.maxCrew),
  buildingType: location?.buildingType ?? '',
  description: location?.description ?? '',
  amenities: [...(location?.amenities ?? [])],
  cancellationPolicy: location?.cancellationPolicy ?? '',
  checkInAfter: location?.checkInAfter ?? '',
  checkoutBefore: location?.checkoutBefore ?? '',
  safety: [...(location?.safety ?? [])],
  images: [...(location?.images ?? [])],
});

const { form, errors, busy } = usePopupForm(
  open,
  () => toForm(props.location),
  () => ({
    title: '',
    pricePerNight: '',
    lat: '',
    lng: '',
    maxCrew: '',
    checkInAfter: '',
    checkoutBefore: '',
  }),
);

// The page keeps this popup mounted and swaps `location` between opens (Add,
// then Edit A, then Edit B), so the prefill has to run per open — the factory
// above only covers construction and the on-close reset.
watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, toForm(props.location));
});

const buildingTypeItems = computed(() =>
  LOCATION_BUILDING_TYPES.map(type => ({ value: type, title: t(`location_building_${type}`) })),
);
const amenityItems = computed(() =>
  LOCATION_AMENITIES.map(id => ({ value: id, title: t(`location_amenity_${id}`) })),
);
const safetyItems = computed(() =>
  LOCATION_SAFETY.map(id => ({ value: id, title: t(`location_safety_${id}`) })),
);

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Blank → `null` ("clear this spec"), which is exactly what the API wants. */
const toIntOrNull = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
};

const toFloatOrNull = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const validate = (): boolean => {
  errors.title = errors.pricePerNight = errors.lat = errors.lng = '';
  errors.maxCrew = errors.checkInAfter = errors.checkoutBefore = '';
  let ok = true;

  if (!form.title.trim()) {
    errors.title = t('common_this_field_is_required');
    ok = false;
  }

  const price = toIntOrNull(form.pricePerNight);
  if (price === null || price < 0) {
    errors.pricePerNight = t('location_form_error_price');
    ok = false;
  }

  // Range checks only bite when the field was actually filled in — a blank
  // coordinate is a legitimate "no map marker".
  const lat = toFloatOrNull(form.lat);
  if (form.lat.trim() && (lat === null || lat < -90 || lat > 90)) {
    errors.lat = t('location_form_error_lat');
    ok = false;
  }
  const lng = toFloatOrNull(form.lng);
  if (form.lng.trim() && (lng === null || lng < -180 || lng > 180)) {
    errors.lng = t('location_form_error_lng');
    ok = false;
  }

  // The backend's @Min(1) on maxCrew would otherwise come back as a bare 400.
  const maxCrew = toIntOrNull(form.maxCrew);
  if (form.maxCrew.trim() && (maxCrew === null || maxCrew < 1)) {
    errors.maxCrew = t('location_form_error_max_crew');
    ok = false;
  }

  if (form.checkInAfter.trim() && !HHMM.test(form.checkInAfter.trim())) {
    errors.checkInAfter = t('location_form_error_time');
    ok = false;
  }
  if (form.checkoutBefore.trim() && !HHMM.test(form.checkoutBefore.trim())) {
    errors.checkoutBefore = t('location_form_error_time');
    ok = false;
  }

  return ok;
};

const submit = async () => {
  if (busy.value || !validate()) return;

  const payload: LocationInput = {
    title: form.title.trim(),
    // validate() already proved this parses to a non-negative integer.
    pricePerNight: toIntOrNull(form.pricePerNight) as number,
  };

  // Free text and the multi-selects always ride along: emptying one of these is
  // a deliberate clear, and '' / [] is how the backend stores "not provided".
  payload.city = form.city.trim();
  payload.country = form.country.trim();
  payload.address = form.address.trim();
  payload.description = form.description.trim();
  payload.cancellationPolicy = form.cancellationPolicy.trim();
  payload.images = [...form.images];
  payload.amenities = [...form.amenities];
  payload.safety = [...form.safety];

  // Nullable numbers: `null` clears the spec. Assigned unconditionally so an
  // emptied field actually reaches the server — omitting the key would leave
  // the old value in place on a PATCH.
  payload.lat = toFloatOrNull(form.lat);
  payload.lng = toFloatOrNull(form.lng);
  payload.houseArea = toIntOrNull(form.houseArea);
  payload.landArea = toIntOrNull(form.landArea);
  payload.floors = toIntOrNull(form.floors);
  payload.rooms = toIntOrNull(form.rooms);
  payload.bathrooms = toIntOrNull(form.bathrooms);
  payload.maxCrew = toIntOrNull(form.maxCrew);

  // Sent unconditionally, blank included: the update DTO accepts '' on these
  // (see HHMM_OR_EMPTY and the buildingType @IsIn) precisely so a set value can
  // be cleared again. Omitting a blank would silently leave the old value in
  // place and make these the only fields on the form you can't undo.
  // '' (not null) is the clear value the DTO allows: @IsOptional() skips null
  // outright, so a null would bypass validation and land in Mongo as null —
  // contradicting the schema default and the `string` on the wire type.
  payload.buildingType = (form.buildingType ?? '') as LocationBuildingType | '';
  payload.checkInAfter = form.checkInAfter.trim();
  payload.checkoutBefore = form.checkoutBefore.trim();

  // Currency is the exception — it has a real default ('AMD') rather than an
  // "unset" state, so a blank keeps whatever is stored instead of blanking it.
  if (form.currency.trim()) payload.currency = form.currency.trim();

  busy.value = true;
  try {
    const saved = props.location
      ? await locationStore.updateLocation(props.location._id, payload)
      : await locationStore.createLocation(payload);
    if (!saved) return;

    open.value = false;
    emit('saved');
  }
  finally {
    busy.value = false;
  }
};
</script>

<style scoped lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid color(--v-theme-on-surface, 0.16);
}

.row {
  display: flex;
  gap: 12px;
  // Bottom-align, so paired fields line up even when one label wraps to a
  // second line (several Armenian spec labels do, in a half-width column).
  align-items: flex-end;

  > * {
    flex: 1;
    min-width: 0;
  }

  // Two-up leaves ~146px per field in a 360px dialog, which clips the number
  // spinners and the unit suffix. Stack them, like every other popup row.
  @include mobile {
    flex-direction: column;
  }
}
</style>
