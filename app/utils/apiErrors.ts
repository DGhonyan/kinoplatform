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
  // email verification codes — reuse the existing register-step copy
  INVALID_CODE: 'register_invalid_code',
  CODE_EXPIRED: 'register_code_expired',
  TOO_MANY_ATTEMPTS: 'register_too_many_attempts',
  // password reset
  INVALID_RESET_CODE: 'error_invalid_reset_code',
  RESET_CODE_EXPIRED: 'error_reset_code_expired',
  RESET_TOO_MANY_ATTEMPTS: 'register_too_many_attempts',
  // events
  EVENT_NOT_FOUND: 'error_event_not_found',
  EVENT_FORBIDDEN: 'error_event_forbidden',
  EVENT_CREATE_FAILED: 'error_event_create_failed',
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
