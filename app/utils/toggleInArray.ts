// Toggle `item` in `arr`. Returns a new array, so it's safe to assign straight
// back to a `v-model`.
export const toggleInArray = <T>(arr: readonly T[], item: T): T[] =>
  arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
