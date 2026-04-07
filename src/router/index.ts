/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const publicRoutes = ['Login', 'VerifyEmail', 'ForgotPassword', 'ResetPassword'];

export const routes = [
  {
    name: 'Home',
    path: '/',
    component: () => import('@/modules/home/views/HomeView.vue'),
  },
  {
    name: 'Crew',
    path: '/crew',
    component: () => import('@/modules/home/views/CrewView.vue'),
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('@/modules/auth/views/AuthView.vue'),
  },
  {
    name: 'VerifyEmail',
    path: '/verify-email',
    component: () => import('@/modules/auth/views/VerifyEmailView.vue'),
  },
  {
    name: 'ForgotPassword',
    path: '/forgot-password',
    component: () => import('@/modules/auth/views/ForgotPasswordView.vue'),
  },
  {
    name: 'ResetPassword',
    path: '/reset-password',
    component: () => import('@/modules/auth/views/ResetPasswordView.vue'),
  },
  {
    name: 'User',
    path: '/user',
    component: () => import('@/modules/home/views/ProfileView.vue'),
  },
  {
    name: 'Users',
    path: '/users/:id',
    component: () => import('@/modules/home/views/ProfileView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Public routes don't need auth
  if (publicRoutes.includes(to.name as string)) {
    // If already logged in, redirect away from login
    if (to.name === 'Login') {
      await authStore.initAuth();
      if (authStore.getUser()) {
        next({ name: 'Home' });
        return;
      }
    }
    next();
    return;
  }

  // Initialize auth state (validates token against server on first call)
  await authStore.initAuth();

  const user = authStore.getUser();

  if ((user && !user.active) && to.name !== 'User') {
    next({ name: 'User' });
    return;
  }

  if (!user) {
    next({ name: 'Login' });
    return;
  }

  next();
});

export default router
