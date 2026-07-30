<template>
  <section class="booking-card">
    <p class="booking-total">
      <strong>{{ nights > 0 ? totalText : priceText }}</strong>
      <span class="booking-total-unit">
        {{ nights > 0 ? $t('location_booking_nights', { count: nights }) : $t('location_per_night') }}
      </span>
    </p>

    <div class="booking-dates">
      <!-- Wrapped so the row's flex sizing lands on a plain div: DateInput's
           root is a v-menu, whose activator is what actually renders. -->
      <div class="booking-field">
        <DateInput
          v-model="checkIn"
          label="location_check_in"
          :min="today"
          prepend-icon="mdi-calendar-blank-outline"
          @update:model-value="error = ''"
        />
      </div>
      <div class="booking-field">
        <DateInput
          v-model="checkOut"
          label="location_check_out"
          :min="minCheckOut"
          prepend-icon="mdi-calendar-blank-outline"
          @update:model-value="error = ''"
        />
      </div>
    </div>

    <Input
      v-model="crewSize"
      type="number"
      min="1"
      :max="location.maxCrew ?? undefined"
      label="location_crew_size"
      :hint="crewHint"
      :persistent-hint="!!crewHint"
      hide-details="auto"
      @update:model-value="error = ''"
    />

    <p
      v-if="error"
      class="booking-error"
    >
      {{ $t(error) }}
    </p>

    <div class="booking-actions">
      <!-- No in-app messaging yet, so "contact" means the host's profile. -->
      <Button
        v-if="location.host"
        variant="secondary"
        prepend-icon="mdi-email-outline"
        :to="`/users/${location.host._id}`"
      >
        {{ $t('location_contact_host') }}
      </Button>
      <Button
        color="primary"
        prepend-icon="mdi-calendar-check-outline"
        :loading="submitting"
        @click="submit"
      >
        {{ $t('location_book_now') }}
      </Button>
    </div>
  </section>
</template>

<script lang="ts" setup>
/**
 * The booking widget on the location detail page.
 *
 * The total shown here is a courtesy estimate only — the server recomputes it
 * from its own price and returns `quotedTotal`, so nothing money-shaped is ever
 * sent up.
 *
 * Guests see the full widget rather than a "log in first" stub: hiding it would
 * hide the price maths that makes the listing worth signing up for. Submitting
 * routes them through /login with a redirect back here.
 */
import type { BookingRequest, LocationDetail } from '~~/shared/types/location';
import Button from '~/components/Button.vue';
import DateInput from '~/components/DateInput.vue';
import Input from '~/components/Input.vue';
import { formatPrice, nightsBetween } from '~/utils/locations';
import { todayLocalDate } from '~/utils/dates';

const props = defineProps<{ location: LocationDetail }>();

const emit = defineEmits<{ submitted: [request: BookingRequest] }>();

const { t, locale } = useI18n();
const route = useRoute();
const locationStore = useLocationStore();

const today = todayLocalDate();

const checkIn = ref('');
const checkOut = ref('');
// v-text-field hands back a string even with type="number"; parsed on submit.
const crewSize = ref('1');
const error = ref('');
const submitting = ref(false);

const nights = computed(() => nightsBetween(checkIn.value, checkOut.value));

const priceText = computed(() =>
  formatPrice(props.location.pricePerHour, props.location.currency, locale.value),
);
const totalText = computed(() =>
  // nights x 24: bookings span calendar days at an hourly rate, so a night is
  // a full day's hire. MUST mirror the server's quotedTotal math.
  formatPrice(props.location.pricePerHour * nights.value * 24, props.location.currency, locale.value),
);

// The calendar can't offer a same-day checkout — the shortest stay is one night.
// Formatted from local components, not toISOString(), which would hand back the
// previous day west of UTC.
const minCheckOut = computed(() => {
  if (!checkIn.value) return today;
  const next = new Date(`${checkIn.value}T00:00:00`);
  next.setDate(next.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
});

const crewHint = computed(() =>
  props.location.maxCrew === null
    ? ''
    : t('location_crew_size_hint', { count: props.location.maxCrew }),
);

const validate = (): boolean => {
  if (!checkIn.value || !checkOut.value) {
    error.value = 'location_booking_error_dates_required';
    return false;
  }
  if (nights.value < 1) {
    error.value = 'error_booking_invalid_dates';
    return false;
  }
  const crew = Number(crewSize.value);
  if (!Number.isInteger(crew) || crew < 1) {
    error.value = 'location_booking_error_crew_invalid';
    return false;
  }
  if (props.location.maxCrew !== null && crew > props.location.maxCrew) {
    error.value = 'location_booking_error_crew_too_large';
    return false;
  }
  error.value = '';
  return true;
};

const submit = async () => {
  // Re-entry guard: the button stays clickable while the request is in flight.
  if (submitting.value) return;

  // Guests: hand them to login with a return ticket rather than failing the
  // POST with a 401 they can't act on.
  if (!useAuthStore().user) {
    navigateTo({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  if (!validate()) return;

  submitting.value = true;
  try {
    const request = await locationStore.requestBooking(props.location._id, {
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      crewSize: Number(crewSize.value),
    });
    if (!request) return;

    emit('submitted', request);
    checkIn.value = '';
    checkOut.value = '';
    crewSize.value = '1';
  }
  finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.booking-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid color(--v-theme-on-surface, 0.16);
  border-radius: 16px;
  background-color: color(--v-theme-on-surface, 0.03);
}

.booking-total {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  font-size: 20px;
  color: color(--v-theme-accent);
}

.booking-total-unit {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.7;
}

.booking-dates {
  display: flex;
  gap: 12px;

  @include mobile {
    flex-direction: column;
  }
}

.booking-field {
  flex: 1 1 0;
  min-width: 0;
}

.booking-error {
  margin: 0;
  font-size: 13px;
  color: color(--v-theme-error);
}

.booking-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  // Two full-width buttons rather than a cramped pair once the card is the
  // whole column width.
  @include mobile {
    flex-direction: column;
  }
}
</style>
