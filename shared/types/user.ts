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

export type Event = {
  _id?: string;
  userId: string;
  startDate: string;
  endDate: string;
  title: string;
  color?: string;
  startTime?: string;
  endTime?: string;
};

export type User = {
  _id: string;
  email: string;
  type: UserType;
  /**
   * Account-in-good-standing flag. `true` for new sign-ups; reserved for
   * admin disable / soft-delete. Do NOT use as the onboarding gate — use
   * `onboardingComplete` (see isOnboardingComplete in registerSteps.ts).
   */
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
  completedSteps: string[];
};
