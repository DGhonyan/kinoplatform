/**
 * Coerce a value that *should* be an array into one, for data crossing the API
 * boundary.
 *
 * `value ?? []` is NOT enough: `??` only catches null/undefined, so a value that
 * arrives as an object (class-transformer turns a non-plain array such as a
 * Mongoose array into `{0: 'a', 1: 'b'}` when it isn't recognised as an Array)
 * sails through and blows up at the first spread with "is not iterable".
 * TypeScript can't help here — the declared type says `string[]`, and the wire
 * disagrees.
 *
 * Object-with-numeric-keys is recovered rather than dropped, so a profile whose
 * list arrived in that shape still shows its existing selections instead of
 * silently resetting to empty.
 */
export const toArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return [...value] as T[];
  if (value && typeof value === 'object') return Object.values(value) as T[];
  return [];
};
