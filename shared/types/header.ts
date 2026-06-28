export type HeaderConfig = {
  /** Show the header cover banner. */
  cover?: boolean;
  /** Which cover image to use. 'default' → header-cover.png, 'home' → home-cover.png. */
  coverImage?: 'default' | 'home';
  /** When false, the cover starts below the nav bar (bar keeps the page bg). Default true. */
  coverNav?: boolean;
  /** Optional i18n key for a slogan overlaid on the cover (supports `\n`). */
  slogan?: string;
  /** Show Join Us / I'm-already-a-member CTAs under the slogan (logged-out only). */
  authCta?: boolean;
};

// Lets pages declare `definePageMeta({ header: { cover, coverImage, slogan, authCta } })`
// with full type-checking, and types `route.meta.header` where the layouts read it.
declare module 'vue-router' {
  interface RouteMeta {
    header?: HeaderConfig;
  }
}
