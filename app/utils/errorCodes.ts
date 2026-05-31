/**
 * Backend error `code`s the frontend knows about. The wire value stays a plain
 * `string` (see `ApiError.code`) — these constants exist so references and
 * comparisons (`apiErrors.ts` map keys, `Login.vue` branch) are typo-checked at
 * build time. A code the backend adds but this list doesn't know simply falls
 * through to the generic message; that's intentional, so keep `ApiError.code`
 * typed as `string`, not `ErrorCode`.
 *
 * Mirror of the backend's `src/common/error-codes.ts` (separate repos, manual sync).
 */
export const ERROR_CODE = {
  // auth
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_EXISTS: 'USER_EXISTS',
  USER_EXISTS_UNVERIFIED: 'USER_EXISTS_UNVERIFIED',
  USER_CREATE_FAILED: 'USER_CREATE_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CURRENT_PASSWORD: 'INVALID_CURRENT_PASSWORD',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  MFA_REQUIRED: 'MFA_REQUIRED',
  // email verification
  INVALID_CODE: 'INVALID_CODE',
  CODE_EXPIRED: 'CODE_EXPIRED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  // password reset
  INVALID_RESET_CODE: 'INVALID_RESET_CODE',
  RESET_CODE_EXPIRED: 'RESET_CODE_EXPIRED',
  RESET_TOO_MANY_ATTEMPTS: 'RESET_TOO_MANY_ATTEMPTS',
  // events
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_FORBIDDEN: 'EVENT_FORBIDDEN',
  EVENT_CREATE_FAILED: 'EVENT_CREATE_FAILED',
  // validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
