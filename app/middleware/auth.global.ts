import { isOnboardingComplete } from '~/utils/onboarding';

export default defineNuxtRouteMiddleware(async (to) => {
  // Public = reachable without login. '/' and '/about' are marketing pages that
  // anyone can see; the auth screens are public too (but bounce logged-in users).
  const publicPaths = ['/', '/about', '/login', '/register', '/forgot-password', '/reset-password'];
  const authOnlyScreens = ['/login', '/register'];
  const path = to.path.replace(/\/+$/, '') || '/';
  const isPublic = publicPaths.includes(path);
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

  if (!user) return navigateTo('/login');
  // Onboarding gate — NOT `active` (which is reserved for account status /
  // soft-delete). Unfinished onboarders are pinned to /user.
  if (!isOnboardingComplete(user) && path !== '/user') return navigateTo('/user');
});
