export enum UserType {
  ADMIN = 'admin',
  USER = 'user',
}

export type Gender = 'male' | 'female' | 'other';

export type Project = {
  name: string;
  /** Optional title in the original language (e.g. non-Latin original). */
  nameOriginal?: string;
  /** Production types — ids from PRODUCTION_TYPES (short_film, feature, …). */
  type: string[];
  /** Roles on the project — profession ids from `professions`. */
  position: string[];
  /** Release year. Omitted while the project is a work in progress. */
  year?: number;
  /** Release month, 1–12. Omitted while the project is a work in progress. */
  month?: number;
  /** True while the project is unreleased / in production (no release date). */
  workInProgress?: boolean;
  link?: string;
  description?: string;
  /** Optional media image URL (poster/still), shown on the project card. */
  media?: string;
};

export type Experience = {
  position: string;
  company: string;
  /** One of EMPLOYMENT_TYPES (full_time, part_time, …). */
  employmentType: string;
  startYear: number;
  startMonth: number;
  endYear?: number;
  endMonth?: number;
  currentlyWorking: boolean;
  description?: string;
};

export type Practicalities = {
  willingToTravel: boolean;
  availableForLongShoots: boolean;
  passportAvailable: boolean;
  visaAvailable: boolean;
  drivingLicenseAvailable: boolean;
};

export type RecommendationAuthor = {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profession?: string[];
};

export type Recommendation = {
  _id: string;
  author: RecommendationAuthor;
  text: string;
  createdAt: string;
};

// Whitelist model: a day is unavailable by default; `allDay` covers the whole
// day, else the startTime–endTime slot. A day may hold several windows.
export type Availability = {
  _id?: string;
  date: string; // YYYY-MM-DD
  allDay: boolean;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  note?: string;
};

// Actor/performer appearance. Color fields hold a predefined id (see
// utils/appearance.ts) — `hairColor` may also hold custom free text.
export type Appearance = {
  height?: number; // cm
  weight?: number; // kg
  hairColor?: string;
  eyeColor?: string;
  skinColor?: string;
  /** Tattoo locations — body-region ids from bodyMap (e.g. 'front_left_forearm'). */
  tattoos?: string[];
  physicalCharacteristics?: string[];
  otherCharacteristic?: string;
  clothingSize?: string;
  shoeSize?: string;
};

export type User = {
  _id: string;
  email: string;
  type: UserType;
  /** Admin disable / soft-delete flag. NOT the onboarding gate — use `onboardingComplete`. */
  active: boolean;
  /** True once all required onboarding steps are done. The onboarding gate. */
  onboardingComplete: boolean;
  firstName: string;
  lastName: string;
  gender?: Gender;
  /** Experience-level id from EXPERIENCE_LEVELS (e.g. 'experience_junior'). */
  experienceLevel?: string;
  bio: string;
  portfolio: string;
  portfolioFile?: string;
  portfolioFileId?: string;
  projects: Project[];
  experience: Experience[];
  tools: string[];
  equipment: string[];
  practicalities?: Practicalities;
  profession: string[];
  avatar?: string;
  avatarFileId?: string;
  birthDate?: string;
  location?: string;
  education?: string;
  languages?: string[];
  /** Actor-only: appearance details + extra photos (2–6). */
  appearance?: Appearance;
  additionalPhotos?: string[];
  completedSteps: string[];
  /** Opt-in for promotional emails; false unless the user ticked it. */
  marketingConsent?: boolean;
  /** PRIVACY_POLICY_VERSION the user last accepted; null = never accepted. */
  acceptedPrivacyVersion?: string | null;
  privacyAcceptedAt?: string | null;
};

// PATCH /account/consent — only the fields being changed.
export type ConsentUpdate = {
  marketingConsent?: boolean;
  acceptedPrivacyVersion?: string;
};

// Talent-search payload (POST /users/talents/search) — all optional, empty = all.
// Disability characteristics are deliberately not filterable.
export type TalentSearchFilters = {
  q?: string;
  professions?: string[];
  locations?: string[];
  educations?: string[];
  languages?: string[];
  genders?: string[];
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  hairColors?: string[];
  eyeColors?: string[];
  skinColors?: string[];
  page?: number;
  limit?: number;
};

// An active login session; `current` marks the device making the request.
export type Session = {
  id: string;
  device: string;
  ip: string;
  createdAt: string;
  current: boolean;
};
