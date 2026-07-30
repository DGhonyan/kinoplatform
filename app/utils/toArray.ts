// `?? []` is not enough: it misses a non-array object from the wire, which then
// throws on spread. Numeric-keyed objects are recovered, not dropped.
export const toArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return [...value] as T[];
  if (value && typeof value === 'object') return Object.values(value) as T[];
  return [];
};
