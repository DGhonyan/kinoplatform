export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/login', '/verify-email', '/forgot-password', '/reset-password'];
  const authStore = useAuthStore();

  if (publicPaths.includes(to.path)) {
    if (to.path === '/login') {
      await authStore.initAuth();
      if (authStore.user) return navigateTo('/');
    }
    return;
  }

  await authStore.initAuth();
  const user = authStore.user;

  if (user && !user.active && to.path !== '/user') return navigateTo('/user');
  if (!user) return navigateTo('/login');
});
