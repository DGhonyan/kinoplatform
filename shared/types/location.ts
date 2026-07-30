// Most descriptive fields are optional — hosts fill in a fraction of them, so
// card and detail render each block only when it has content.

/** KEEP IN SYNC with the backend's location.constants.ts. */
export const LOCATION_AMENITIES = [
  'wifi',
  'water_heating',
  'heating',
  'hygiene_products',
  'fridge',
  'tv',
  'coffee_maker',
  'parking',
  'kitchen',
  'air_conditioning',
  'power_generator',
] as const;
export type LocationAmenity = (typeof LOCATION_AMENITIES)[number];

export const LOCATION_SAFETY = [
  'carbon_monoxide_alarm',
  'smoke_alarm',
  'first_aid_kit',
  'fire_extinguisher',
  'must_climb_stairs',
  'security_camera',
] as const;
export type LocationSafety = (typeof LOCATION_SAFETY)[number];

export const LOCATION_BUILDING_TYPES = [
  'wooden',
  'stone',
  'brick',
  'concrete',
  'glass',
  'other',
] as const;
export type LocationBuildingType = (typeof LOCATION_BUILDING_TYPES)[number];

export const LOCATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type LocationStatus = (typeof LOCATION_STATUSES)[number];

export const BOOKING_REQUEST_STATUSES = [
  'pending',
  'accepted',
  'declined',
  'cancelled',
] as const;
export type BookingRequestStatus = (typeof BOOKING_REQUEST_STATUSES)[number];

/** The host, flattened onto the location by the API (no second request). */
export type LocationHost = {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  /** Average of the host's received recommendations, 0 when none. */
  rating: number;
  bio: string;
};

export type LocationReview = {
  /** `null` when the author is deleted or hidden — the review still counts toward the rating. */
  author: (Pick<LocationHost, '_id' | 'firstName' | 'lastName' | 'avatar'> & {
    profession: string[];
  }) | null;
  rating: number;
  text: string;
  createdAt: string;
};

/** Card-level shape — what the list endpoint returns. */
export type Location = {
  _id: string;
  title: string;
  city: string;
  country: string;
  pricePerHour: number;
  currency: string;
  images: string[];
  rooms: number | null;
  maxCrew: number | null;
  buildingType: string;
  amenities: LocationAmenity[];
  /** Average of `reviews`, 0 when none — precomputed so cards don't reduce. */
  rating: number;
  reviewCount: number;
  status: LocationStatus;
  createdAt: string;
};

/** Detail shape — everything the location page renders. */
export type LocationDetail = Location & {
  address: string;
  /** Raw display-host override values — the admin edit form prefills from these. */
  hostName: string;
  hostAvatar: string;
  lat: number | null;
  lng: number | null;
  houseArea: number | null;
  landArea: number | null;
  floors: number | null;
  bathrooms: number | null;
  description: string;
  cancellationPolicy: string;
  checkInAfter: string;
  checkoutBefore: string;
  safety: LocationSafety[];
  host: LocationHost | null;
  reviews: LocationReview[];
};

// Admin create/edit payload — PATCH writes exactly the keys it receives.
// `null` on the nullable numbers clears a spec back to "not provided".
export type LocationInput = {
  title: string;
  pricePerHour: number;
  city?: string;
  country?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  currency?: string;
  images?: string[];
  houseArea?: number | null;
  landArea?: number | null;
  floors?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  maxCrew?: number | null;
  /** Display-host override shown instead of the real host; `''` clears. */
  hostName?: string;
  hostAvatar?: string;
  /** `''` clears it — the update DTO allows the empty string for exactly that. */
  buildingType?: LocationBuildingType | '';
  description?: string;
  amenities?: LocationAmenity[];
  cancellationPolicy?: string;
  /** 'HH:mm', or `''` to clear. The backend rejects any other shape. */
  checkInAfter?: string;
  checkoutBefore?: string;
  safety?: LocationSafety[];
};

/** Filters the list page sends as a query string. */
export type LocationQuery = {
  q?: string;
  city?: string;
  buildingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  minCrew?: number;
  amenities?: LocationAmenity[];
};

/** What the booking widget submits. */
export type BookingRequestInput = {
  checkIn: string; // 'YYYY-MM-DD'
  checkOut: string; // 'YYYY-MM-DD'
  crewSize: number;
  message?: string;
};

export type BookingRequest = {
  _id: string;
  locationId: string;
  checkIn: string;
  checkOut: string;
  crewSize: number;
  message: string;
  quotedTotal: number;
  currency: string;
  status: BookingRequestStatus;
  createdAt: string;
};
