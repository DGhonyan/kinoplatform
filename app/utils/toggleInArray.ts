/**
 * Toggle `item` in `arr`: remove it if present, otherwise append it. Returns a new
 * array (never mutates), so it's safe to assign straight back to a `v-model`.
 */
export const toggleInArray = <T>(arr: readonly T[], item: T): T[] =>
  arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
