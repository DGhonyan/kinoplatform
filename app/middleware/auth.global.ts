export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/login', '/verify-email', '/forgot-password', '/reset-password'];
  const path = to.path.replace(/\/+$/, '') || '/';
  const authStore = useAuthStore();

  if (publicPaths.includes(path)) {
    if (path === '/login') {
      await authStore.initAuth();
      if (authStore.user) return navigateTo('/');
    }
    return;
  }

  await authStore.initAuth();
  const user = authStore.user;

  if (user && !user.active && path !== '/user') return navigateTo('/user');
  if (!user) return navigateTo('/login');
});
