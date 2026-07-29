<template>
  <div class="location-detail">
    <NuxtLink
      to="/locations"
      class="back-link"
    >
      <v-icon size="18">
        mdi-arrow-left
      </v-icon>
      {{ $t('common_locations') }}
    </NuxtLink>

    <div
      v-if="loading"
      class="state"
    >
      <v-progress-circular
        indeterminate
        size="28"
        width="3"
        color="primary"
      />
    </div>

    <p
      v-else-if="!location"
      class="state empty"
    >
      {{ $t('error_location_not_found') }}
    </p>

    <template v-else>
      <div class="detail-head">
        <!-- "Title – City, Country – 45,000 AMD per night" as separate spans
             rather than one interpolated sentence: the place drops out cleanly
             for a listing with no country, and the line wraps at the dashes
             instead of mid-price. -->
        <h1 class="detail-title">
          <span>{{ location.title }}</span>
          <template v-if="place">
            <span
              class="title-sep"
              aria-hidden="true"
            >–</span>
            <span>{{ place }}</span>
          </template>
          <span
            class="title-sep"
            aria-hidden="true"
          >–</span>
          <span class="title-price">
            {{ price }}
            <span class="title-price-unit">{{ $t('location_per_night') }}</span>
          </span>
        </h1>

        <div class="detail-actions">
          <Button
            variant="secondary"
            :prepend-icon="isSaved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
            :aria-pressed="isSaved"
            @click="toggleSaved"
          >
            {{ $t(isSaved ? 'location_saved' : 'location_save') }}
          </Button>
          <Button
            color="primary"
            prepend-icon="mdi-calendar-blank-outline"
            @click="scrollToBooking"
          >
            {{ $t('location_book') }}
          </Button>
        </div>
      </div>

      <!-- Always rendered: MediaGallery owns its own "no photos yet" frame, and
           hosts routinely publish before uploading anything. -->
      <MediaGallery
        :images="location.images"
        :alt="location.title"
      />

      <!-- Every block below is gated on actually having content. Most fields on
           the model are optional and real listings fill in a fraction of them,
           so a sparse location renders as a short page rather than a long one
           full of blank rows. -->
      <section
        v-if="infoItems.length"
        class="block"
      >
        <h2 class="block-title">
          {{ $t('location_information') }}
        </h2>
        <ul class="info-strip">
          <li
            v-for="item in infoItems"
            :key="item.key"
            class="info-item"
          >
            <span class="info-label">{{ item.label }}</span>
            <span class="info-value">{{ item.value }}</span>
          </li>
        </ul>
      </section>

      <section
        v-if="location.description"
        class="block"
      >
        <h2 class="block-title">
          {{ $t('location_description') }}
        </h2>
        <p class="description">
          {{ location.description }}
        </p>
      </section>

      <section
        v-if="amenities.length"
        class="block"
      >
        <h2 class="block-title">
          {{ $t('location_whats_included') }}
        </h2>
        <ul class="amenities">
          <li
            v-for="id in amenities"
            :key="id"
            class="amenity"
          >
            <v-icon size="20">
              {{ AMENITY_ICONS[id] }}
            </v-icon>
            {{ $t(`location_amenity_${id}`) }}
          </li>
        </ul>
      </section>

      <section
        v-if="hasImportant"
        class="block"
      >
        <h2 class="block-title">
          {{ $t('location_important_to_know') }}
        </h2>
        <div class="important">
          <div
            v-if="location.cancellationPolicy"
            class="important-column"
          >
            <h3 class="important-title">
              <v-icon size="18">
                mdi-calendar-remove-outline
              </v-icon>
              {{ $t('location_cancellation_policy') }}
            </h3>
            <p class="important-text">
              {{ location.cancellationPolicy }}
            </p>
          </div>

          <div
            v-if="hasHouseRules"
            class="important-column"
          >
            <h3 class="important-title">
              <v-icon size="18">
                mdi-key-outline
              </v-icon>
              {{ $t('location_house_rules') }}
            </h3>
            <ul class="important-list">
              <li v-if="location.checkInAfter">
                {{ $t('location_check_in_after', { time: location.checkInAfter }) }}
              </li>
              <li v-if="location.checkoutBefore">
                {{ $t('location_checkout_before', { time: location.checkoutBefore }) }}
              </li>
            </ul>
          </div>

          <div
            v-if="safety.length"
            class="important-column"
          >
            <h3 class="important-title">
              <v-icon size="18">
                mdi-shield-check-outline
              </v-icon>
              {{ $t('location_safety_and_property') }}
            </h3>
            <ul class="important-list">
              <li
                v-for="id in safety"
                :key="id"
                class="safety-item"
              >
                <v-icon size="16">
                  {{ SAFETY_ICONS[id] }}
                </v-icon>
                {{ $t(`location_safety_${id}`) }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div class="stay">
        <div class="stay-main">
          <section
            v-if="location.host"
            class="block host"
          >
            <div class="host-identity">
              <img
                :src="hostAvatar"
                alt=""
                class="host-avatar"
              >
              <span class="host-label">{{ $t('location_hosted_by') }}</span>
              <NuxtLink
                :to="`/users/${location.host._id}`"
                class="host-name"
              >
                {{ location.host.firstName }} {{ location.host.lastName }}
              </NuxtLink>
              <span
                v-if="location.host.rating > 0"
                class="host-rating"
              >
                <v-icon size="14">
                  mdi-star
                </v-icon>
                {{ location.host.rating }}
              </span>
            </div>

            <div class="host-body">
              <h2 class="block-title">
                {{ $t('location_about_host') }}
              </h2>
              <p
                v-if="location.host.bio"
                class="host-bio"
              >
                {{ location.host.bio }}
              </p>
            </div>
          </section>

          <div
            ref="bookingRef"
            class="booking-anchor"
          >
            <BookingRequestCard
              :location="location"
              @submitted="requestSent = true"
            />
            <p
              v-if="requestSent"
              class="booking-sent"
            >
              <v-icon size="16">
                mdi-check-circle-outline
              </v-icon>
              {{ $t('location_booking_sent') }}
            </p>
          </div>
        </div>

        <!-- LocationMap renders nothing without coordinates; skipping it here too
             keeps the grid from reserving an empty column for it. -->
        <LocationMap
          v-if="hasCoords"
          :lat="location.lat"
          :lng="location.lng"
          :address="location.address"
          class="stay-map"
        />
      </div>

      <section
        v-if="location.reviews.length"
        class="block reviews"
      >
        <h2 class="reviews-title">
          {{ $t('location_reviews') }}
          <span
            v-if="location.reviewCount > 0"
            class="reviews-rating"
          >
            <v-icon size="16">
              mdi-star
            </v-icon>
            {{ location.rating }} ({{ location.reviewCount }})
          </span>
        </h2>

        <Carousel :items="location.reviews">
          <template #item="{ item: review }">
            <article class="review-card">
              <div class="review-head">
                <img
                  :src="review.author?.avatar || defaultAvatar"
                  alt=""
                  class="review-avatar"
                >
                <span class="review-identity">
                  <!-- An unattributed review still shows its text and rating;
                       only the name is withheld. -->
                  <span
                    v-if="review.author"
                    class="review-name"
                  >
                    {{ review.author.firstName }} {{ review.author.lastName }}
                  </span>
                  <span
                    v-if="professionOf(review)"
                    class="review-profession"
                  >{{ professionOf(review) }}</span>
                </span>
                <span class="review-rating">
                  <v-icon size="14">
                    mdi-star
                  </v-icon>
                  {{ review.rating }}
                </span>
              </div>
              <p class="review-text">
                {{ review.text }}
              </p>
              <span class="review-date">{{ formatDate(review.createdAt, locale) }}</span>
            </article>
          </template>
        </Carousel>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { LocationDetail, LocationReview } from '~~/shared/types/location';
import { LOCATION_BUILDING_TYPES } from '~~/shared/types/location';
import Button from '~/components/Button.vue';
import Carousel from '~/components/Carousel.vue';
import MediaGallery from '~/components/MediaGallery.vue';
import BookingRequestCard from '~/components/locations/BookingRequestCard.vue';
import LocationMap from '~/components/locations/LocationMap.vue';
import { AMENITY_ICONS, SAFETY_ICONS, formatPrice } from '~/utils/locations';
import { formatDate } from '~/utils/dates';

// Public page (in the auth allowlist) — guests browse the listing in full and
// are only sent to /login when they submit a booking request.
const route = useRoute();
const { t, locale } = useI18n();
const locationStore = useLocationStore();

const defaultAvatar = new URL('@/assets/default.jpg', import.meta.url).href;

const location = ref<LocationDetail | null>(null);
const loading = ref(true);
const requestSent = ref(false);
const bookingRef = ref<HTMLElement | null>(null);

const place = computed(() =>
  [location.value?.city, location.value?.country].filter(Boolean).join(', '),
);
const price = computed(() =>
  location.value
    ? formatPrice(location.value.pricePerNight, location.value.currency, locale.value)
    : '',
);
const hasCoords = computed(
  () => !!location.value && location.value.lat !== null && location.value.lng !== null,
);
const hostAvatar = computed(() => location.value?.host?.avatar || defaultAvatar);

// The wire values are plain strings, so drop anything this build doesn't know
// rather than printing a raw `location_amenity_*` key at the user.
const amenities = computed(() => (location.value?.amenities ?? []).filter(id => id in AMENITY_ICONS));
const safety = computed(() => (location.value?.safety ?? []).filter(id => id in SAFETY_ICONS));

const buildingTypeLabel = computed(() => {
  const type = location.value?.buildingType;
  if (!type) return '';
  // An unrecognised type still says something useful; only known ones translate.
  return (LOCATION_BUILDING_TYPES as readonly string[]).includes(type)
    ? t(`location_building_${type}`)
    : type;
});

/*
 * The Information strip carries only the specs the host actually filled in —
 * "Number of floors: —" is worse than no row at all, and two of the seeded
 * listings have almost none of these.
 */
const infoItems = computed(() => {
  const data = location.value;
  if (!data) return [];

  const items: { key: string; label: string; value: string }[] = [];
  const area = (value: number) => t('location_area_sqm', { value });

  if (data.houseArea !== null) items.push({ key: 'houseArea', label: t('location_house_area'), value: area(data.houseArea) });
  if (data.landArea !== null) items.push({ key: 'landArea', label: t('location_land_area'), value: area(data.landArea) });
  if (data.floors !== null) items.push({ key: 'floors', label: t('location_floors'), value: String(data.floors) });
  if (data.rooms !== null) items.push({ key: 'rooms', label: t('location_rooms'), value: String(data.rooms) });
  if (data.bathrooms !== null) items.push({ key: 'bathrooms', label: t('location_bathrooms'), value: String(data.bathrooms) });
  if (buildingTypeLabel.value) items.push({ key: 'buildingType', label: t('location_building_type'), value: buildingTypeLabel.value });

  return items;
});

const hasHouseRules = computed(
  () => !!location.value?.checkInAfter || !!location.value?.checkoutBefore,
);
const hasImportant = computed(
  () => !!location.value?.cancellationPolicy || hasHouseRules.value || safety.value.length > 0,
);

const professionOf = (review: LocationReview) =>
  (review.author?.profession ?? []).map(p => t(p)).join(' | ');

const scrollToBooking = () =>
  bookingRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });

/*
 * There is no favourites endpoint yet, so "Save" is a browser-local bookmark: it
 * survives a reload but never leaves this device. Swap the two helpers below for
 * a store action once the backend ships one.
 */
const SAVED_KEY = 'saved-locations';

const savedIds = ref<string[]>([]);
const isSaved = computed(() => !!location.value && savedIds.value.includes(location.value._id));

const toggleSaved = () => {
  const id = location.value?._id;
  if (!id) return;
  savedIds.value = isSaved.value
    ? savedIds.value.filter(saved => saved !== id)
    : [...savedIds.value, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds.value));
};

onMounted(() => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
    savedIds.value = Array.isArray(stored) ? stored.filter(id => typeof id === 'string') : [];
  }
  catch {
    // Hand-edited or half-written storage — start clean rather than blowing up.
    savedIds.value = [];
  }
});

// Watched rather than fetched in onMounted: the host link and any future
// related-locations strip keep the user on this route, so the component is
// reused and onMounted wouldn't fire again. The sequence guard keeps a slow
// earlier response from clobbering a newer one.
let loadSeq = 0;
watch(
  () => route.params.id,
  async (id) => {
    if (!id) return;
    const seq = ++loadSeq;
    loading.value = true;
    requestSent.value = false;

    const data = await locationStore.getLocation(String(id));
    if (seq !== loadSeq) return; // superseded by a newer navigation

    location.value = data;
    loading.value = false;
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.location-detail {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  font-size: 14px;
  color: color(--v-theme-on-surface, 0.7);
  text-decoration: none;

  &:hover {
    color: color(--v-theme-on-surface);
  }
}

.state {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}

.empty {
  font-size: 14px;
  opacity: 0.6;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.25;
  overflow-wrap: anywhere;

  @include mobile {
    font-size: 20px;
  }
}

.title-sep {
  opacity: 0.4;
}

.title-price {
  color: color(--v-theme-accent);
}

.title-price-unit {
  font-size: 14px;
  font-weight: 400;
  opacity: 0.7;
}

.detail-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;

  @include mobile {
    width: 100%;

    // Two equal pills rather than a cramped pair pushed against the edge.
    > * {
      flex: 1 1 0;
    }
  }
}

.block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.info-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 28px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
}

.info-item {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.info-label {
  opacity: 0.65;
}

.info-value {
  font-weight: 600;
}

.description {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  opacity: 0.85;
  // Preserve the host's paragraph breaks.
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.amenities {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.amenity {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 1px solid color(--v-theme-on-surface, 0.16);
  border-radius: 999px;
  background-color: color(--v-theme-on-surface, 0.03);
  font-size: 13px;
}

.important {
  // Three columns that collapse one at a time — a listing with only a
  // cancellation policy gets a single full-width column, not a lonely third.
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  align-items: start;
  text-align: center;
}

.important-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.important-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.important-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.75;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.important-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  opacity: 0.75;
}

.safety-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.stay {
  // auto-fit rather than two fixed tracks: with no map the remaining column
  // collapses and the host + booking pair spans the full width.
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  align-items: start;
}

.stay-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.stay-map {
  min-width: 0;
  // Match the column beside it rather than the component's stock height.
  --location-map-height: 340px;
}

// Portrait column beside the copy, per the design. `.block` sets column, so the
// direction is overridden rather than re-declared.
.host {
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;

  @include mobile {
    flex-direction: column;
    align-items: center;
  }
}

.host-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  width: 120px;
  text-align: center;
}

.host-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.host-label {
  font-size: 13px;
  opacity: 0.65;
}

.host-name {
  font-size: 15px;
  font-weight: 600;
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.host-rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  color: color(--v-theme-accent);
}

.host-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
}

.host-bio {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.8;
  overflow-wrap: anywhere;
}

.booking-anchor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  // Vuetify's .v-input is `flex: 1 1 auto`; the booking card is full of fields,
  // so pin the wrapper's own sizing and let the card keep its natural height.
  flex: 0 0 auto;
  // Without a map the column collapses to the full page width — a 1100px-wide
  // date pair reads as a form, not a booking widget.
  width: 100%;
  max-width: 520px;
}

.booking-sent {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  color: color(--v-theme-success);
}

.reviews {
  border-top: 1px solid color(--v-theme-on-surface, 0.14);
  padding-top: 24px;
}

.reviews-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.reviews-rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 14px;
  font-weight: 500;
  color: color(--v-theme-accent);
}

.review-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 300px;
  padding: 16px;
  border: 1px solid color(--v-theme-on-surface, 0.14);
  border-radius: 14px;
  background-color: color(--v-theme-on-surface, 0.03);

  @include mobile {
    width: 240px;
  }
}

.review-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.review-identity {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1 1 auto;
}

.review-name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-profession {
  font-size: 12px;
  opacity: 0.65;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  font-size: 13px;
  color: color(--v-theme-accent);
}

.review-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  opacity: 0.85;
  // Cap the card height so the strip stays even across wildly different reviews.
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.review-date {
  font-size: 12px;
  opacity: 0.55;
}
</style>
