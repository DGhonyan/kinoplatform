<template>
  <div class="header-container">
    <!-- Cover image + scrim fill the whole header (bar + hero band). -->
    <template v-if="cover">
      <img
        :src="coverSrc"
        alt=""
        class="header-cover-image"
      >
      <div class="header-cover-scrim" />
    </template>

    <div
      class="header-content"
      :class="{ 'bar-solid': cover && !coverNav }"
    >
      <NuxtLink
        to="/"
        class="title"
      >
        <h1>Kinoplatform</h1>
      </NuxtLink>

      <div
        v-if="visibleLinks.length"
        class="links"
      >
        <NuxtLink
          v-for="link in visibleLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          :class="{ active: route.path === link.path }"
        >
          {{ $t(link.label) }}
        </NuxtLink>
      </div>

      <div class="actions">
        <!-- Guests-only: members switch language from Settings instead. -->
        <LanguageSwitch v-if="!user" />

        <!-- Logged-out, off the home hero: a single auth toggle button.
             On the home hero the CTAs live under the slogan instead. -->
        <Button
          v-if="!user && !authCta"
          variant="primary"
          color="white"
          text-color="primary"
          rounded="pill"
          @click="navigateTo(isOnLogin ? '/register' : '/login')"
        >
          {{ $t(isOnLogin ? 'common_register' : 'common_login') }}
        </Button>

        <v-menu
          v-else-if="user"
          location="bottom end"
        >
          <template #activator="{ props: menuProps }">
            <button
              type="button"
              class="profile-trigger"
              v-bind="menuProps"
              :aria-label="$t('common_account_menu')"
            >
              <v-icon
                icon="custom:profile"
                class="profile-avatar-icon"
              />
              <v-icon
                icon="mdi-chevron-down"
                class="profile-chevron"
              />
            </button>
          </template>

          <v-list
            density="compact"
            min-width="180"
          >
            <v-list-item
              to="/user"
              prepend-icon="mdi-account-outline"
              :title="$t('common_my_profile')"
            />
            <v-list-item
              to="/settings"
              prepend-icon="mdi-cog-outline"
              :title="$t('common_settings')"
            />
            <v-list-item
              prepend-icon="mdi-logout"
              :title="$t('common_logout')"
              @click="showLogoutDialog = true"
            />
          </v-list>
        </v-menu>
      </div>

      <v-dialog
        v-model="showLogoutDialog"
        max-width="400px"
      >
        <v-card>
          <v-card-title class="text-h5">
            {{ $t('common_confirm_logout') }}
          </v-card-title>
          <v-card-text>
            {{ $t('common_are_you_sure_you_want_to_logout') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <Button
              color="grey"
              variant="text"
              @click="showLogoutDialog = false"
            >
              {{ $t('common_cancel') }}
            </Button>
            <Button
              color="primary"
              variant="text"
              @click="confirmLogout"
            >
              {{ $t('common_logout') }}
            </Button>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!-- Hero band: the Bebas slogan, plus auth CTAs for logged-out visitors. -->
    <div
      v-if="cover"
      class="header-hero"
      :class="{ 'hero-centered': !coverNav }"
    >
      <p
        v-if="slogan"
        class="header-slogan"
      >
        {{ $t(slogan) }}
      </p>

      <div
        v-if="showAuthCta"
        class="header-cta"
      >
        <Button
          color="primary"
          rounded="pill"
          @click="navigateTo('/register')"
        >
          {{ $t('home_cta_join') }}
        </Button>
        <Button
          color="white"
          text-color="primary"
          rounded="pill"
          @click="navigateTo('/login')"
        >
          {{ $t('home_cta_login') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from './Button.vue';
import { isOnboardingComplete } from '~/utils/onboarding';

// Mirrors HeaderConfig (shared/types/header.ts). Kept as an inline literal —
// the Vue SFC compiler resolves prop names from this at compile time, and it
// does NOT reliably resolve a type imported via the `~~/` alias (the props would
// silently not register). Keep this in sync with HeaderConfig.
const props = withDefaults(
  defineProps<{
    cover?: boolean;
    coverImage?: 'default' | 'home';
    coverNav?: boolean;
    slogan?: string;
    authCta?: boolean;
  }>(),
  { cover: false, coverImage: 'default', coverNav: true },
);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const route = useRoute();
const showLogoutDialog = ref(false);

const isOnboarded = computed(() => !!user.value && isOnboardingComplete(user.value));

// Public links show to everyone; auth-only links (whose pages would bounce/throw
// for guests and onboarders) show only once onboarding is complete.
type NavLink = { path: string; label: string; public: boolean };
const headerLinks: NavLink[] = [
  { path: '/', label: 'common_home', public: true },
  { path: '/about', label: 'common_about', public: true },
  { path: '/crew', label: 'common_crew', public: false },
];
const visibleLinks = computed(() =>
  headerLinks.filter(link => link.public || isOnboarded.value),
);

const coverSrc = computed(() =>
  props.coverImage === 'home'
    ? new URL('../assets/home-cover.png', import.meta.url).href
    : new URL('../assets/header-cover.png', import.meta.url).href,
);

// The under-slogan CTAs only make sense for logged-out visitors.
const showAuthCta = computed(() => !!props.authCta && !user.value);

const isOnLogin = computed(() => route.path.replace(/\/+$/, '') === '/login');

const confirmLogout = async () => {
  showLogoutDialog.value = false;
  await authStore.logout();
  authStore.resetInitState();
  navigateTo('/login');
};
</script>

<style scoped lang="scss">
.header-container {
  position: relative;
  z-index: 1;
}

// Cover image fills the entire header (bar + hero band) on cover pages.
.header-cover-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

// Darken the image so the bar text, slogan and buttons stay legible on any cover.
.header-cover-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(0, 0, 0, 0.3) 45%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

/*
 * Skin tokens — override on an ancestor to recolor this header per-page.
 *   --header-fg     body text, link rest state
 *   --header-accent title, hover/active link state
 */
.header-content {
  --header-fg: #{color(--v-theme-on-surface)};
  --header-accent: #{color(--v-theme-accent)};

  position: relative;
  // Fixed 3-column track (title | nav | actions). The side columns are equal
  // (1fr), so the nav stays put no matter what the actions column holds — the
  // login button, the profile menu, or nothing (home hero) — which kills the
  // layout shift when auth state resolves or the route changes.
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: $base-padding;
  color: var(--header-fg);
  z-index: 2;
}

// Opaque bar that hides the cover behind it, so the cover starts below the nav.
.header-content.bar-solid {
  background: color(--v-theme-background);
}

.title {
  justify-self: start;
  color: var(--header-accent);
  text-decoration: none;
}

.links {
  justify-self: center;
  display: flex;
  gap: 16px;
}

.actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: none;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  color: var(--header-fg);

  &:hover {
    opacity: 0.85;
  }
}

// v-icon sizes off font-size; the chevron is deliberately smaller than the icon.
.profile-avatar-icon {
  font-size: 30px;
}

.profile-chevron {
  font-size: 18px;
}

.nav-link {
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  color: inherit;

  &:visited {
    color: inherit;
  }

  &:hover,
  &.active {
    text-underline-offset: 4px;
    text-decoration: underline;
  }
}

// Hero band on cover pages: the Bebas slogan + optional logged-out CTAs.
.header-hero {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  // Home hero is left-aligned; the 16px padding matches $base-padding so the
  // slogan lines up under the "Kinoplatform" title.
  align-items: flex-start;
  gap: 28px;
  padding: 40px 16px 64px;
  text-align: left;
}

// Cover-below-the-nav pages (crew): the band is shorter, so center the slogan
// in it (both axes) with symmetric padding instead of top/left-aligning it.
.header-hero.hero-centered {
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding-top: 40px;
  padding-bottom: 40px;
  text-align: center;
}

.header-slogan {
  margin: 0;
  font-family: 'Bebas Neue', sans-serif;
  text-transform: uppercase;
  font-size: 56px;
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: 1px;
  // Honor the `\n` in the slogan i18n value as a real line break.
  white-space: pre-line;
  color: #fbfbfb;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.header-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 600px) {
  .header-slogan {
    font-size: 40px;
  }
}
</style>
