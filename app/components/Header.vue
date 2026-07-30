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
      ref="barRef"
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
        ref="linksRef"
        class="links"
        :class="{ measuring: collapsed }"
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
        <div
          ref="actionsInnerRef"
          class="actions-inner"
          :class="{ measuring: collapsed }"
        >
          <!-- Guests-only: members switch language from Settings instead. -->
          <LanguageSwitch />

          <!-- Logged-out, off the home hero: a single auth toggle button. -->
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

          <HeaderAccountMenu
            v-else-if="user"
            @logout="showLogoutDialog = true"
          />
        </div>

        <!-- Collapsed (nav no longer fits): everything folds into the drawer. -->
        <HeaderMobileMenu
          v-if="collapsed"
          :links="visibleLinks"
          :authed="!!user"
          :is-on-login="isOnLogin"
          @logout="showLogoutDialog = true"
        />
      </div>

      <ConfirmDialog
        v-model="showLogoutDialog"
        :title="$t('common_confirm_logout')"
        :text="$t('common_are_you_sure_you_want_to_logout')"
        :confirm-label="$t('common_logout')"
        @confirm="confirmLogout"
      />
    </div>

    <HeaderHero
      v-if="cover"
      :slogan="slogan"
      :show-cta="showAuthCta"
      :centered="!coverNav"
    />
  </div>
</template>

<script lang="ts" setup>
import Button from './Button.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import HeaderAccountMenu from './header/AccountMenu.vue';
import HeaderMobileMenu from './header/MobileMenu.vue';
import HeaderHero from './header/Hero.vue';
import { isOnboardingComplete } from '~/utils/onboarding';

// Keep in sync with HeaderConfig (shared/types/header.ts); inline because the SFC compiler can't resolve `~~/` props types.
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
  { path: '/crew', label: 'common_crew', public: true },
  { path: '/talents', label: 'common_talents', public: false },
  { path: '/announcements', label: 'common_announcements', public: true },
  { path: '/locations', label: 'common_locations', public: true },
];
const visibleLinks = computed(() =>
  headerLinks.filter(link => link.public || isOnboarded.value),
);

// ── Intrinsic nav collapse ──────────────────────────────────────────────────
// Collapse when the pieces stop fitting, not at a hardcoded breakpoint. Hidden
// probes stay rendered so natural widths remain measurable (no oscillation).
const barRef = ref<HTMLElement | null>(null);
const linksRef = ref<HTMLElement | null>(null);
const actionsInnerRef = ref<HTMLElement | null>(null);
const collapsed = ref(false);

const measure = () => {
  const bar = barRef.value;
  const links = linksRef.value;
  if (!bar || !links) return;

  const title = bar.querySelector<HTMLElement>('.title');

  // Read real gap/padding — hardcoded copies of the SCSS tokens would drift silently.
  const cs = getComputedStyle(bar);
  const gap = parseFloat(cs.columnGap) || 0;
  const padding = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);

  // `1fr auto 1fr` forces the side tracks EQUAL, so the bar needs twice the
  // wider side — summing title + actions would under-estimate and let the nav overlap.
  const side = Math.max(
    title?.offsetWidth ?? 0,
    actionsInnerRef.value?.offsetWidth ?? 0,
  );
  const needed = side * 2 + links.scrollWidth + gap * 2 + padding;

  collapsed.value = needed > bar.clientWidth;
};

// Observe the bar (viewport resize), the links (locale label-width changes), and
// the actions (auth state changes the button vs. avatar width).
useResizeObserver([barRef, linksRef, actionsInnerRef], measure);

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

.header-cover-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

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

// Skin tokens — override on an ancestor to recolor this header per-page.
// Inherited through the DOM by the header/* subcomponents too.
.header-content {
  --header-fg: #{color(--v-theme-on-surface)};
  --header-accent: #{color(--v-theme-accent)};

  position: relative;
  // Equal 1fr side columns keep the nav centered whatever the actions column
  // holds — no layout shift when auth state resolves.
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: $base-padding;
  color: var(--header-fg);
  z-index: 2;
  // Clips the hidden measuring probes (see `.measuring`), which are wider than
  // the bar when collapsed. Menus/dialogs are teleported, so nothing real is clipped.
  overflow: hidden;
}

// Opaque bar that hides the cover behind it, so the cover starts below the nav.
.header-content.bar-solid {
  background: color(--v-theme-background);
}

// Columns are assigned explicitly: an abspos grid child (`.measuring`) drops
// out of auto-placement, which would slide `.actions` into the middle column.
.title {
  grid-column: 1;
  justify-self: start;
  color: var(--header-accent);
  text-decoration: none;
}

.links {
  grid-column: 2;
  justify-self: center;
  display: flex;
  gap: 16px;
}

.actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 16px;
}

.actions-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

// `width: max-content` is load-bearing: the abspos probe's grid-area containing
// block collapses to 0, and shrink-to-fit against it would under-measure.
.measuring {
  position: absolute;
  top: 0;
  left: 0;
  width: max-content;
  visibility: hidden;
  pointer-events: none;
}

.nav-link {
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  color: inherit;
  // A wrappable label would squeeze the nav column instead of tripping the collapse.
  white-space: nowrap;

  &:visited {
    color: inherit;
  }

  &:hover,
  &.active {
    text-underline-offset: 4px;
    text-decoration: underline;
  }
}
</style>
