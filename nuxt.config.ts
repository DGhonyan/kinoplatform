import { fileURLToPath } from 'node:url';
import { lightColors } from './design-system/colors';

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
    baseURL: '/kinoplatform/',
  },

  css: [
    '@mdi/font/css/materialdesignicons.css',
    '@fontsource/roboto/latin-100.css',
    '@fontsource/roboto/latin-300.css',
    '@fontsource/roboto/latin-400.css',
    '@fontsource/roboto/latin-500.css',
    '@fontsource/roboto/latin-700.css',
    '@fontsource/roboto/latin-900.css',
  ],

  runtimeConfig: {
    public: {
      apiUrl: 'https://kinoplatform-backend-536061277482.europe-west1.run.app',
    },
  },

  devServer: {
    port: 3000,
  },

  compatibilityDate: '2025-01-01',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/login', '/forgot-password', '/reset-password', '/verify-email', '/user', '/crew'],
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
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: lightColors,
          },
          dark: {
            dark: true,
          },
        },
      },
    },
    moduleOptions: {
      styles: {
        configFile: `${rootDir}styles/settings.scss`,
      },
    },
  },
});
