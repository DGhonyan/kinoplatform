import type { Availability } from '~~/shared/types/user';

export type DayStatus = 'available' | 'partial' | 'unavailable';

/** Group availability windows by their 'YYYY-MM-DD' date. */
export const groupWindowsByDate = (
  windows: Availability[],
): Record<string, Availability[]> => {
  const map: Record<string, Availability[]> = {};
  for (const w of windows) (map[w.date] ??= []).push(w);
  return map;
};

/**
 * A day's status from its windows (whitelist model): an all-day window → fully
 * available, any partial window → partially available, none → unavailable.
 * Shared so the owner editor and a future booker view derive it identically.
 */
export const dayStatus = (windows: Availability[] | undefined): DayStatus => {
  if (!windows || windows.length === 0) return 'unavailable';
  if (windows.some(w => w.allDay)) return 'available';
  return 'partial';
};
