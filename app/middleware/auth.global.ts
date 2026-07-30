import { isOnboardingComplete } from '~/utils/onboarding';

export default defineNuxtRouteMiddleware(async (to) => {
  // Public = reachable without login. '/' and '/about' are marketing pages that
  // anyone can see; the auth screens are public too (but bounce logged-in users).
  const publicPaths = ['/', '/about', '/announcements', '/locations', '/crew', '/talents', '/login', '/register', '/forgot-password', '/reset-password'];
  const authOnlyScreens = ['/login', '/register'];
  const path = to.path.replace(/\/+$/, '') || '/';
  // Location details and member profiles (/users/:id, NOT /user) are public too;
  // announcement details stay gated — hence targeted prefixes, not a blanket rule.
  const isPublic
    = publicPaths.includes(path)
      || path.startsWith('/locations/')
      || path.startsWith('/users/');
  const authStore = useAuthStore();

  // Gated pages always validate. Public pages only do when there's a local signal
  // of a session, so anonymous visitors never force a /me call.
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
