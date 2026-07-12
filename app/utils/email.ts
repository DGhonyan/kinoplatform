// Basic email shape check for inline form validation. Deliberately lenient (the
// backend + the verification-code round-trip are the real gate) — just catches
// obvious typos before a request goes out. Mirrors app/utils/password.ts.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());
