import { isOnboardingComplete } from '~/utils/onboarding';

export default defineNuxtRouteMiddleware(async (to) => {
  // Public = reachable without login. '/' and '/about' are marketing pages that
  // anyone can see; the auth screens are public too (but bounce logged-in users).
  const publicPaths = ['/', '/about', '/announcements', '/locations', '/login', '/register', '/forgot-password', '/reset-password'];
  const authOnlyScreens = ['/login', '/register'];
  const path = to.path.replace(/\/+$/, '') || '/';
  // Location *detail* pages are public as well: the marketplace is the shop
  // window, so a guest reads a full listing and only meets /login when they
  // actually send a booking request. Same for member profiles (/users/:id, NOT
  // /user, which is the owner's own editor) — the backend serves guests the
  // public field set. Announcement details stay gated — hence targeted prefixes
  // rather than "anything nested under a public parent".
  const isPublic
    = publicPaths.includes(path)
      || path.startsWith('/locations/')
      || path.startsWith('/users/');
  const authStore = useAuthStore();

  // On gated pages, always validate the session. On public pages, only validate
  // when there's a local signal of one — so the header reflects logged-in state
  // there, without forcing a /me call for genuinely anonymous visitors.
  if (!isPublic || localStorage.getItem('user')) {
    await authStore.initAuth();
  }
  const user = authStore.user;

  if (isPublic) {
    // Authenticated users have no business on the auth screens. Unfinished
    // onboarders go to /user (wizard / essentials resume); everyone else home.
    if (user && authOnlyScreens.includes(path)) {
      return navigateTo(isOnboardingComplete(user) ? '/' : '/user');
    }
    return;
  }

  // Bounce guests to login, remembering where they were headed so login can
  // return them there (e.g. a shared announcement detail link).
  if (!user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
  }
  // Onboarding gate — NOT `active` (which is reserved for account status /
  // soft-delete). Unfinished onboarders are pinned to /user.
  if (!isOnboardingComplete(user) && path !== '/user') return navigateTo('/user');
});
