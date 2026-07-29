import type { ApiError } from './api';
import type { ErrorCode } from './errorCodes';

/**
 * Central map of backend error `code`s → i18n keys. The backend's `code` is the
 * stable contract; the frontend owns the localized text. Whenever the backend
 * gains a new error code, add a row here and the matching locale entry.
 */
const ERROR_MESSAGE_KEYS: Partial<Record<ErrorCode, string>> = {
  // auth
  EMAIL_NOT_VERIFIED: 'error_email_not_verified',
  ACCOUNT_LOCKED: 'error_account_locked',
  INVALID_CREDENTIALS: 'error_invalid_credentials',
  USER_EXISTS: 'error_user_exists',
  USER_EXISTS_UNVERIFIED: 'error_user_exists_unverified',
  USER_CREATE_FAILED: 'error_user_create_failed',
  USER_NOT_FOUND: 'error_user_not_found',
  INVALID_CURRENT_PASSWORD: 'error_invalid_current_password',
  SESSION_EXPIRED: 'common_session_expired',
  MFA_REQUIRED: 'error_mfa_required',
  EMAIL_IN_USE: 'error_email_in_use',
  // user onboarding
  INVALID_STEP_DATA: 'error_invalid_step_data',
  // email verification codes — reuse the existing register-step copy
  INVALID_CODE: 'register_invalid_code',
  CODE_EXPIRED: 'register_code_expired',
  TOO_MANY_ATTEMPTS: 'register_too_many_attempts',
  // password reset
  INVALID_RESET_CODE: 'error_invalid_reset_code',
  RESET_CODE_EXPIRED: 'error_reset_code_expired',
  RESET_TOO_MANY_ATTEMPTS: 'register_too_many_attempts',
  // availability
  AVAILABILITY_NOT_FOUND: 'error_availability_not_found',
  AVAILABILITY_FORBIDDEN: 'error_availability_forbidden',
  AVAILABILITY_CREATE_FAILED: 'error_availability_create_failed',
  AVAILABILITY_INVALID_WINDOW: 'error_availability_invalid_window',
  // announcements
  ANNOUNCEMENT_NOT_FOUND: 'error_announcement_not_found',
  ANNOUNCEMENT_FORBIDDEN: 'error_announcement_forbidden',
  ANNOUNCEMENT_CREATE_FAILED: 'error_announcement_create_failed',
  // locations / booking requests
  LOCATION_NOT_FOUND: 'error_location_not_found',
  BOOKING_REQUEST_INVALID_DATES: 'error_booking_invalid_dates',
  BOOKING_REQUEST_CREW_TOO_LARGE: 'location_booking_error_crew_too_large',
  BOOKING_REQUEST_RANGE_TOO_LONG: 'error_booking_range_too_long',
  BOOKING_REQUEST_PAST_DATE: 'error_booking_past_date',
  // recommendations
  CANNOT_RECOMMEND_SELF: 'error_cannot_recommend_self',
  ONBOARDING_INCOMPLETE: 'error_onboarding_incomplete',
  RECOMMENDATION_NOT_FOUND: 'error_recommendation_not_found',
  RECOMMENDATION_FORBIDDEN: 'error_recommendation_forbidden',
  // files / uploads
  FILE_NOT_FOUND: 'error_file_not_found',
  FILE_FORBIDDEN: 'error_file_forbidden',
  FILE_INVALID_KIND: 'error_file_invalid_kind',
  FILE_INVALID_TYPE: 'error_file_invalid_type',
  FILE_TOO_LARGE: 'error_file_too_large',
  FILE_NOT_UPLOADED: 'error_file_not_uploaded',
  FILE_NOT_READY: 'error_file_not_ready',
  UPLOAD_VERIFICATION_FAILED: 'error_file_verification_failed',
  // validation — forms validate client-side, so this is a rare fallback; the
  // per-field detail is on `error.errors` for callers that want to show it inline.
  VALIDATION_ERROR: 'error_validation',
};

/** Generic, always-translated fallback when no message is available at all. */
export const GENERIC_ERROR_KEY = 'common_unexpected_error';

/**
 * Resolve a backend error to the text to display. Pass the result to `t()` for
 * inline errors, or straight to `showMessage` (which `Message.vue` translates).
 *
 * Resolution order:
 *   1. mapped code  → i18n key (localized)
 *   2. unmapped/absent code → raw backend message (English, graceful during
 *      migration; `Message.vue` renders non-keys verbatim). A dev-only warning
 *      fires for *unmapped* codes so missing mappings surface.
 *   3. no message at all → generic localized key
 *
 * Once every backend throw carries a mapped code, step 2's raw fallback should
 * stop firing — flip it to `GENERIC_ERROR_KEY` then if you want strict mode.
 */
export const apiErrorMessageKey = (error: ApiError): string => {
  // `error.code` is an arbitrary wire string; the Partial map returns
  // `string | undefined`, so an unknown code simply misses.
  const mapped = error.code ? ERROR_MESSAGE_KEYS[error.code as ErrorCode] : undefined;
  if (mapped) {
    return mapped;
  }

  if (import.meta.dev && error.code) {
    console.warn(`[api] unmapped error code "${error.code}": ${error.message}`);
  }

  return error.message || GENERIC_ERROR_KEY;
};
