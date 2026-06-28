import { fileURLToPath } from 'node:url';
import { lightColors, darkColors } from './design-system/colors';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineNuxtConfig({

  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
  ],
  ssr: false,
  app: {
    baseURL: '/',
  },

  css: [
    '@mdi/font/css/materialdesignicons.css',
    '@fontsource/roboto/latin-100.css',
    '@fontsource/roboto/latin-300.css',
    '@fontsource/roboto/latin-400.css',
    '@fontsource/roboto/latin-500.css',
    '@fontsource/roboto/latin-700.css',
    '@fontsource/roboto/latin-900.css',
    '@fontsource/bebas-neue/latin-400.css',
  ],

  runtimeConfig: {
    public: {
      apiUrl: 'https://api.kinoplatform.com',
    },
  },

  devServer: {
    port: 5173,
  },

  compatibilityDate: '2025-01-01',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/login', '/register', '/forgot-password', '/reset-password', '/user', '/crew'],
      failOnError: false,
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${rootDir}styles/_utils" as *; @use "${rootDir}styles/variables" as *;`,
        },
      },
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@azure/storage-blob',
        'mime',
      ],
    },
  },

  typescript: {
    strict: true,
  },

  eslint: {
    config: {
      stylistic: {
        semi: true,
      },
    },
  },

  i18n: {
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'hy', file: 'hy.json' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
  },

  vuetify: {
    // Note: the custom SVG icon set ('custom:*') is registered at runtime by
    // app/plugins/vuetify-icons.client.ts, not here — `import.meta.glob` only
    // works in Vite-processed code, not in the config file (which is loaded
    // by jiti at build time).
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          light: {
            dark: false,
            colors: lightColors,
          },
          dark: {
            dark: true,
            colors: darkColors,
          },
        },
      },
      // Shared field config so the wrapper components (Input/Select/TextArea)
      // don't each repeat variant / hide-details. Per-instance props (and
      // anything passed at a call site) still override these.
      defaults: {
        VTextField: { variant: 'outlined', hideDetails: 'auto' },
        VTextarea: { variant: 'outlined', hideDetails: 'auto' },
        VAutocomplete: { variant: 'outlined', hideDetails: 'auto' },
        VSelect: { variant: 'outlined', hideDetails: 'auto' },
      },
    },
    moduleOptions: {
      styles: {
        configFile: `${rootDir}styles/settings.scss`,
      },
    },
  },
});
