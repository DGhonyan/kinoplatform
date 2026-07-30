// Deliberately lenient shape check for inline validation — the backend and the
// verification round-trip are the real gate; this just catches obvious typos.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());
