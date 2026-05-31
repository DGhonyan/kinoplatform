export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const path = to.path.replace(/\/+$/, '') || '/';
  const authStore = useAuthStore();

  if (publicPaths.includes(path)) {
    // If we have any signal of an existing session, validate it and bounce
    // authenticated users away from /login and /register. Half-onboarded users
    // go to /user where the wizard resumes; everyone else goes home.
    if ((path === '/login' || path === '/register') && localStorage.getItem('user')) {
      await authStore.initAuth();
      if (authStore.user) {
        return navigateTo(authStore.user.active ? '/' : '/user');
      }
    }
    return;
  }

  await authStore.initAuth();
  const user = authStore.user;

  if (user && !user.active && path !== '/user') return navigateTo('/user');
  if (!user) return navigateTo('/login');
});
