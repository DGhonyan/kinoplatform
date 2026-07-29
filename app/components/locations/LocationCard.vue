<template>
  <NuxtLink
    :to="`/locations/${location._id}`"
    class="location-card"
  >
    <div class="card-media">
      <img
        v-if="cover"
        :src="cover"
        :alt="location.title"
        class="card-image"
        loading="lazy"
      >
      <!-- Hosts routinely publish before uploading photos; an empty frame reads
           better than a broken <img>. -->
      <div
        v-else
        class="card-image card-image-empty"
      >
        <v-icon size="32">
          mdi-image-off-outline
        </v-icon>
      </div>

      <span
        v-if="location.reviewCount > 0"
        class="card-rating"
      >
        <v-icon size="14">mdi-star</v-icon>
        {{ location.rating }}
        <span class="card-review-count">({{ location.reviewCount }})</span>
      </span>
    </div>

    <div class="card-body">
      <h3 class="card-title">
        {{ location.title }}
      </h3>

      <p class="card-place">
        <v-icon size="14">mdi-map-marker-outline</v-icon>
        {{ place }}
      </p>

      <!-- Both specs are optional on the model, so the row disappears entirely
           rather than printing an em dash for a host who skipped them. -->
      <ul
        v-if="facts.length"
        class="card-facts"
      >
        <li
          v-for="fact in facts"
          :key="fact.icon"
          class="card-fact"
        >
          <v-icon size="14">{{ fact.icon }}</v-icon>
          {{ fact.text }}
        </li>
      </ul>

      <p class="card-price">
        <strong>{{ price }}</strong>
        <span class="card-price-unit">{{ $t('location_per_night') }}</span>
      </p>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { Location } from '~~/shared/types/location';
import { formatPrice } from '~/utils/locations';

const props = defineProps<{ location: Location }>();

const { t, locale } = useI18n();

const cover = computed(() => props.location.images[0] ?? '');
// `country` is optional in practice for domestic listings — don't leave a
// dangling comma when it's blank.
const place = computed(() =>
  [props.location.city, props.location.country].filter(Boolean).join(', '),
);
const price = computed(() =>
  formatPrice(props.location.pricePerNight, props.location.currency, locale.value),
);

const facts = computed(() => {
  const list: { icon: string; text: string }[] = [];
  if (props.location.rooms !== null) {
    list.push({ icon: 'mdi-door', text: t('location_rooms_count', { count: props.location.rooms }) });
  }
  if (props.location.maxCrew !== null) {
    list.push({ icon: 'mdi-account-group-outline', text: t('location_crew_count', { count: props.location.maxCrew }) });
  }
  return list;
});
</script>

<style scoped lang="scss">
.location-card {
  // Same sizing contract as UserCard: fixed by default, but a container that
  // lays the cards out itself (the directory grid) overrides the custom
  // property and lets its track own the width.
  width: var(--location-card-width, 280px);
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid color(--v-theme-on-surface, 0.14);
  border-radius: 16px;
  background-color: color(--v-theme-on-surface, 0.03);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.12s ease, transform 0.12s ease;

  &:hover {
    border-color: color(--v-theme-primary, 0.5);
    transform: translateY(-2px);
  }
}

.card-media {
  position: relative;
}

.card-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  // `contain` so the card shows the whole photo. Location shots are uploaded
  // uncropped in whatever framing the space needed, and `cover` would silently
  // crop the very thing the photo was taken to show. The tinted backdrop turns
  // the resulting letterbox into a deliberate frame rather than a gap.
  object-fit: contain;
  display: block;
  background-color: color(--v-theme-on-surface, 0.06);
}

.card-image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: color(--v-theme-on-surface, 0.35);
}

.card-rating {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  // Sits over arbitrary photography, so it carries its own scrim rather than
  // relying on a theme surface.
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.card-review-count {
  font-weight: 400;
  opacity: 0.75;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px 14px;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  // One line: card heights stay even across the grid.
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.card-place {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
  min-width: 0;
}

.card-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  opacity: 0.75;
}

.card-fact {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px;
  margin: 2px 0 0;
  font-size: 15px;
  color: color(--v-theme-accent);
}

.card-price-unit {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.7;
}

// Two per row on phones — trim the chrome so the photo keeps the width.
@include mobile {
  .card-body {
    padding: 10px;
    gap: 4px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-place,
  .card-price {
    font-size: 12px;
  }

  .card-facts {
    font-size: 11px;
  }
}
</style>
