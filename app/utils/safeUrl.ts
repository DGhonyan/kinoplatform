/**
 * Guard external URLs from the backend before binding them into an `href`. A
 * `javascript:` (or `data:`) URL would execute on click, so only http/https pass;
 * anything else (or an unparseable string) returns `undefined` so callers can skip
 * rendering the link.
 */
export const safeExternalUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return (u.protocol === 'http:' || u.protocol === 'https:') ? url : undefined;
  }
  catch {
    return undefined;
  }
};
