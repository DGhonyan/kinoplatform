// Mirrors the backend PASSWORD_REGEX in auth.dto.ts, except the 8–32 length lives
// in the regex here (the backend splits it across @MinLength/@MaxLength).
export const PASSWORD_RE
  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,32}$/;

export const isStrongPassword = (value: string): boolean => PASSWORD_RE.test(value);
