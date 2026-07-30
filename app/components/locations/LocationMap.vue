<template>
  <!-- No coordinates, no map: an empty grey rectangle would read as a failure. -->
  <div
    v-if="hasCoords"
    class="location-map"
  >
    <div
      ref="containerRef"
      class="map-canvas"
    />
    <p
      v-if="address"
      class="map-address"
    >
      {{ $t('location_address', { address }) }}
    </p>
  </div>
</template>

<script lang="ts" setup>
// Leaflet is imported dynamically in onMounted — it touches `window` at import
// time, so a static import would break the moment SSR is switched on.
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';

const props = withDefaults(
  defineProps<{
    lat: number | null;
    lng: number | null;
    /** Street address printed under the map. Omitted when the host left it blank. */
    address?: string;
    zoom?: number;
  }>(),
  { address: '', zoom: 15 },
);

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
// CARTO's terms require attributing both them and OSM.
const TILE_ATTRIBUTION
  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors '
    + '&copy; <a href="https://carto.com/attributions">CARTO</a>';

const containerRef = ref<HTMLElement | null>(null);
let map: LeafletMap | null = null;
let disposed = false;

const hasCoords = computed(() => props.lat !== null && props.lng !== null);

onMounted(async () => {
  if (!hasCoords.value) return;

  const L = await import('leaflet');
  // The dynamic import is a microtask boundary — the component can be gone
  // (fast back-navigation) by the time it settles.
  if (disposed || !containerRef.value) return;

  map = L.map(containerRef.value, {
    center: [props.lat as number, props.lng as number],
    zoom: props.zoom,
    // The map sits mid-page; grabbing the wheel would trap the page scroll.
    scrollWheelZoom: false,
    attributionControl: true,
  });

  L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 20 }).addTo(map);

  // Vector marker — Leaflet's default pin PNG breaks under Vite asset hashing.
  // Leaflet paints SVG attributes, not CSS, so the theme token must be read.
  const primary = getComputedStyle(containerRef.value).getPropertyValue('--v-theme-primary').trim();
  L.circleMarker([props.lat as number, props.lng as number], {
    radius: 9,
    weight: 3,
    color: '#fff',
    fillColor: primary ? `rgb(${primary})` : undefined,
    fillOpacity: 1,
  }).addTo(map);
});

// The detail page reuses this component when navigating between locations.
watch(
  () => [props.lat, props.lng] as const,
  ([lat, lng]) => {
    if (map && lat !== null && lng !== null) map.setView([lat, lng], props.zoom);
  },
);

onBeforeUnmount(() => {
  disposed = true;
  map?.remove();
  map = null;
});
</script>

<style scoped lang="scss">
.location-map {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-canvas {
  width: 100%;
  height: var(--location-map-height, 320px);
  border-radius: 16px;
  // Leaflet paints tiles into absolutely-positioned panes that ignore the
  // radius; clipping here is what actually rounds the map.
  overflow: hidden;
  background-color: color(--v-theme-on-surface, 0.06);
}

.map-address {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
}

// Leaflet builds its controls outside Vue's scope, so these need :deep to
// reach them — they ship light-theme defaults that glare on our dark surface.
.map-canvas :deep(.leaflet-control-attribution) {
  background: rgba(0, 0, 0, 0.6);
  color: color(--v-theme-on-surface, 0.7);
  font-size: 10px;

  a {
    color: color(--v-theme-on-surface, 0.9);
  }
}

.map-canvas :deep(.leaflet-bar a) {
  background-color: color(--v-theme-background);
  color: color(--v-theme-on-surface);
  border-bottom-color: color(--v-theme-on-surface, 0.2);

  &:hover {
    background-color: color(--v-theme-on-surface, 0.12);
  }
}
</style>
