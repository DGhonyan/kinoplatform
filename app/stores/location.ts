import { defineStore } from 'pinia';
import type {
  BookingRequest,
  BookingRequestInput,
  Location,
  LocationDetail,
  LocationInput,
  LocationQuery,
} from '~~/shared/types/location';

// Empty facets are dropped, so an untouched panel produces a bare `/locations`;
// `amenities` repeats the key (`?amenities=a&amenities=b`) as the backend parses.
const buildLocationQuery = (query: LocationQuery): string => {
  const params = new URLSearchParams();

  const { amenities, ...scalars } = query;
  for (const [key, value] of Object.entries(scalars)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  for (const amenity of amenities ?? []) {
    params.append('amenities', amenity);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const useLocationStore = defineStore('location', {
  actions: {
    // Public marketplace listing — filters ride in the query string.
    async listLocations(query: LocationQuery = {}) {
      return apiRequest(`/locations${buildLocationQuery(query)}`, {
        errorMessage: 'error_load_locations_failed',
      }).get<Location[]>();
    },

    // Distinct cities across published locations, for the city facet.
    async listCities() {
      return apiRequest('/locations/cities', {
        errorMessage: 'error_load_locations_failed',
      }).get<string[]>();
    },

    // No `errorMessage`: an override wins over apiErrorMessageKey and would
    // shadow the LOCATION_NOT_FOUND mapping.
    async getLocation(id: string) {
      return apiRequest(`/locations/${id}`).get<LocationDetail>();
    },

    // The server computes `quotedTotal` from its own price — the widget's total is
    // display-only. No `errorMessage`, so BOOKING_REQUEST_INVALID_DATES survives.
    async requestBooking(id: string, payload: BookingRequestInput) {
      return apiRequest(`/locations/${id}/requests`, {
        loader: true,
        successMessage: 'location_booking_sent',
      }).post<BookingRequest>(payload);
    },

    // ── Admin catalogue management (/admin/locations) ──
    // No `errorMessage` on these either — an override would shadow LOCATION_NOT_FOUND.
    async createLocation(payload: LocationInput) {
      return apiRequest('/locations', {
        loader: true,
        successMessage: 'location_created',
      }).post<LocationDetail>(payload);
    },

    // Partial edit — only the keys on `payload` are written server-side.
    async updateLocation(id: string, payload: Partial<LocationInput>) {
      return apiRequest(`/locations/${id}`, {
        loader: true,
        successMessage: 'location_updated',
      }).patch<LocationDetail>(payload);
    },

    async deleteLocation(id: string) {
      return apiRequest(`/locations/${id}`, {
        loader: true,
        successMessage: 'location_deleted',
      }).delete<{ message: string }>();
    },

    // The caller's own sent requests.
    async myBookingRequests() {
      return apiRequest('/locations/requests/mine', {
        errorMessage: 'error_load_booking_requests_failed',
      }).get<BookingRequest[]>();
    },
  },
});
