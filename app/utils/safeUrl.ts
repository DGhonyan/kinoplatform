// Guards a backend URL before it reaches an href: a `javascript:`/`data:` URL
// would execute on click, so only http/https pass; anything else → undefined.
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
