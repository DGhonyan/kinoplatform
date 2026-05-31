import { h, type Component } from 'vue';

/**
 * Registers a `custom:*` icon set with Vuetify, sourced from `app/assets/icons/`.
 *
 * Drop a new `.svg` in that folder → it's automatically available as
 * `<v-icon icon="custom:<filename-without-ext>" />`. Hardcoded stroke/fill
 * colors are folded to `currentColor` so v-icon's `color` prop themes the
 * icon, and width/height attrs are stripped so the icon scales with the
 * `size` prop.
 *
 * We register the set by mutating Vuetify's reactive IconOptions, which is
 * provided on the root Vue app via the symbol `Symbol.for('vuetify:icons')`.
 * Vuetify uses `reactive(...)` for that object in `createIcons()`, so adding
 * a key triggers v-icon's lookup to find it on subsequent renders.
 *
 * Using `import.meta.glob` (Vite-only) means this must run in runtime code,
 * not in vuetify-nuxt-module's config file (which is loaded by jiti).
 */
const modules = import.meta.glob<string>('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const iconMap: Record<string, string> = {};

for (const [path, raw] of Object.entries(modules)) {
  const name = path.match(/\/([^/]+)\.svg$/)?.[1];
  if (!name) continue;

  iconMap[name] = raw
    .replace(/\swidth="[^"]*"/, '')
    .replace(/\sheight="[^"]*"/, '')
    .replace(/<svg/, '<svg width="100%" height="100%"')
    .replace(/stroke="(?!none|currentColor)[^"]*"/g, 'stroke="currentColor"')
    .replace(/fill="(?!none|currentColor)[^"]*"/g, 'fill="currentColor"');
}

const CustomSvgIcon: Component = {
  name: 'CustomSvgIcon',
  props: {
    icon: { type: String, required: true },
  },
  setup(props) {
    return () => {
      const svg = iconMap[props.icon as string];
      if (!svg) {
        if (import.meta.dev) {
          console.warn(`[custom icons] Unknown icon: "${props.icon}". Add app/assets/icons/${props.icon}.svg.`);
        }
        return null;
      }
      return h('span', {
        class: 'v-icon__custom-svg',
        style: {
          display: 'inline-flex',
          width: '1em',
          height: '1em',
          lineHeight: 1,
        },
        innerHTML: svg,
      });
    };
  },
};

type VuetifyIconSets = Record<string, { component: Component }>;
type VuetifyIconOptions = { sets?: VuetifyIconSets };

const ICON_SYMBOL = Symbol.for('vuetify:icons');

export default defineNuxtPlugin({
  name: 'vuetify-custom-icons',
  setup(nuxtApp) {
    if (import.meta.dev) {
      console.info(`[custom icons] Discovered ${Object.keys(iconMap).length} icon(s):`, Object.keys(iconMap));
    }

    // Plugin ordering via `enforce: 'post'` doesn't beat vuetify-nuxt-module's
    // module-level plugin registration. Defer to `app:created`, which fires
    // after *all* plugins (including Vuetify's) have completed their setup.
    nuxtApp.hook('app:created', () => {
      const provides = (nuxtApp.vueApp._context as { provides: Record<symbol, unknown> }).provides;
      const iconOptions = provides[ICON_SYMBOL] as VuetifyIconOptions | undefined;

      if (!iconOptions?.sets) {
        if (import.meta.dev) {
          console.warn('[custom icons] Vuetify IconOptions still not on vueApp._context.provides at app:created. Skipping.');
        }
        return;
      }

      iconOptions.sets.custom = { component: CustomSvgIcon };

      if (import.meta.dev) {
        console.info('[custom icons] Registered set "custom". Existing sets:', Object.keys(iconOptions.sets));
      }
    });
  },
});
