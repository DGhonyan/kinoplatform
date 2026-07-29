import { defineStore } from 'pinia';
import type {
  BookingRequest,
  BookingRequestInput,
  Location,
  LocationDetail,
  LocationInput,
  LocationQuery,
} from '~~/shared/types/location';

/**
 * Serialize the filter panel's state into the query string the list endpoint
 * expects. Empty/absent facets are dropped rather than sent blank, so an
 * untouched panel produces a bare `/locations`; `amenities` repeats the key
 * (`?amenities=wifi&amenities=parking`), which is what the backend parses.
 */
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

    /*
     * Full detail — public, so guests can browse before signing up.
     *
     * No `errorMessage`: api.ts resolves `opts.errorMessage ?? apiErrorMessageKey(error)`,
     * so an override always wins and would shadow LOCATION_NOT_FOUND,
     * leaving that mapping dead. Same reasoning as
     * announcement.ts — only the un-addressed list actions keep an override.
     */
    async getLocation(id: string) {
      return apiRequest(`/locations/${id}`).get<LocationDetail>();
    },

    /*
     * Send a booking request. Authed. The server computes `quotedTotal` from its
     * own price — the widget's total is display-only and is never submitted.
     * No `errorMessage`, so BOOKING_REQUEST_INVALID_DATES survives.
     */
    async requestBooking(id: string, payload: BookingRequestInput) {
      return apiRequest(`/locations/${id}/requests`, {
        loader: true,
        successMessage: 'location_booking_sent',
      }).post<BookingRequest>(payload);
    },

    /*
     * ── Admin catalogue management (/admin/locations) ──
     *
     * None of the three passes an `errorMessage`, for the same reason
     * `getLocation` doesn't: api.ts resolves `opts.errorMessage ?? apiErrorMessageKey(error)`,
     * so an override always wins and would shadow LOCATION_NOT_FOUND —
     * the code these endpoints actually return.
     */
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
