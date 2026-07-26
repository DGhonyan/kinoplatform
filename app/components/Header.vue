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
  { path: '/talents', label: 'common_talents', public: false },
  { path: '/announcements', label: 'common_announcements', public: true },
];
const visibleLinks = computed(() =>
  headerLinks.filter(link => link.public || isOnboarded.value),
);

// ── Intrinsic nav collapse ──────────────────────────────────────────────────
// Collapse the inline nav into a hamburger when the pieces stop fitting, rather
// than at a hardcoded viewport width. The nav + actions stay rendered (just
// visually hidden when collapsed) so their *natural* widths remain measurable —
// that makes the check stable (no expand/collapse oscillation) and locale-aware
// (Armenian labels are wider, so the collapse point shifts automatically).
const barRef = ref<HTMLElement | null>(null);
const linksRef = ref<HTMLElement | null>(null);
const actionsInnerRef = ref<HTMLElement | null>(null);
const collapsed = ref(false);

const measure = () => {
  const bar = barRef.value;
  const links = linksRef.value;
  if (!bar || !links) return;

  const title = bar.querySelector<HTMLElement>('.title');

  // Read the real gap/padding rather than hardcoding copies of the SCSS —
  // `$base-padding` is a shared token, and a silent drift here would move the
  // collapse threshold with no error anywhere.
  const cs = getComputedStyle(bar);
  const gap = parseFloat(cs.columnGap) || 0;
  const padding = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);

  // `grid-template-columns: 1fr auto 1fr` forces the two side tracks to be
  // EQUAL, so the bar needs twice the wider side — not title + actions. Using
  // the sum under-estimates whenever the actions column outgrows the title
  // (logged-in avatar, longer locale) and lets the nav overlap before collapsing.
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
 * Consumed by descendants (nav links here; the profile trigger and hamburger
 * in the header/* subcomponents), so they inherit it through the DOM.
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
  // Clips the hidden measuring probes (see `.measuring`), which are wider than
  // the bar by definition when collapsed — otherwise they'd push a horizontal
  // scrollbar onto every page. Menus/dialogs are teleported, so nothing real
  // gets clipped.
  overflow: hidden;
}

// Opaque bar that hides the cover behind it, so the cover starts below the nav.
.header-content.bar-solid {
  background: color(--v-theme-background);
}

/*
 * Columns are assigned explicitly, never by auto-placement. When the nav
 * collapses, `.links` goes `position: absolute` (see `.measuring`) and an
 * absolutely-positioned grid child drops out of auto-placement entirely — which
 * would slide `.actions` from column 3 into the middle column and park the
 * hamburger in the centre of the bar. Same story when `visibleLinks` is empty
 * and `.links` never renders.
 */
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

/*
 * Collapsed pieces stay in the DOM (measurable natural width) but out of flow
 * and invisible, so the fit check never oscillates.
 *
 * `width: max-content` is load-bearing: an absolutely-positioned grid child
 * takes its own grid area as containing block, and that track collapses to 0
 * once the child leaves the flow. Shrink-to-fit against 0 would squeeze the
 * probe to min-content and report a bogus width — under-measuring, which lets
 * the bar un-collapse at a size where it doesn't fit, then re-collapse. Pinning
 * max-content makes the probe report its true natural width regardless.
 */
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
  // Keep each link on one line: a wrappable label ("About us") would let the
  // grid squeeze the nav column word-by-word instead of tripping the collapse.
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
