import { h, type Component } from 'vue';

// Registers a `custom:*` icon set from app/assets/icons/. Must live in runtime
// code, not vuetify-nuxt-module's config: `import.meta.glob` is Vite-only.
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

    // `enforce: 'post'` doesn't beat vuetify-nuxt-module's registration. Defer to
    // `app:created`, which fires after every plugin (Vuetify's included) is set up.
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
