# Verifying changes

Use Node 22.12+ (this repo pins Node 24 via `.nvmrc`). Run `nvm use` before commands if your shell isn't already on it — `@nuxt/eslint` needs `Object.groupBy`, which Node 20 doesn't have.

After any edit, both of these must pass:

- `npm run typecheck`
- `npm run lint`

Do **not** start the dev server (`npm run dev`) to verify changes. The user
runs it locally; a parallel run hits port locks and confuses things. Type
errors and lint failures are the contract.

# Project layout (Nuxt 4 SPA, `ssr: false`)

- `app/` — Nuxt's `srcDir`
  - `app.vue` — root component (wraps `<NuxtLayout>` + `<NuxtPage>`)
  - `pages/` — file-based routes
  - `layouts/` — page layouts (`default.vue`, `auth.vue`)
  - `components/` — auto-imported (subdir adds prefix: `auth/Login.vue` → `<AuthLogin>`)
  - `middleware/`, `stores/`, `utils/` — auto-imported by name
  - `assets/` — images and other transformed assets
- `shared/types/` — types shared between client and (future) server. Import via `~~/shared/types/...`
- `i18n/locales/` — translation JSON, picked up by `@nuxtjs/i18n`
- `styles/`, `design-system/` — build-time SCSS partials and Vuetify theme tokens, consumed by `nuxt.config.ts` only (not runtime code)

# Adding a page

Create `app/pages/<name>.vue`. The file path is the route:

- `pages/about.vue` → `/about`
- `pages/users/[id].vue` → `/users/:id` (read with `useRoute().params.id`)
- `pages/users/index.vue` → `/users`
- `pages/[...slug].vue` → catch-all

Pages get `layouts/default.vue` automatically. To pick another:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>
```

# Adding a layout

Create `app/layouts/<name>.vue`. Render the page where the slot goes:

```vue
<template>
  <Header />
  <div class="layout-content">
    <slot />
  </div>
</template>
```

Reference it from a page with `definePageMeta({ layout: '<name>' })`.

# Conventions

- Pinia stores are setup-style: `defineStore('name', () => { ... })`. Read state directly (`authStore.user`), not via getters.
- API calls go through `useApi('/path').get<T>()/.post<T>(body)/.patch/.delete`. Base URL comes from `runtimeConfig.public.apiUrl`.
- Don't import `ref`, `computed`, `watch`, `useRoute`, `useRouter`, `navigateTo`, `storeToRefs`, store hooks, or utils — they're auto-imported. **Types are NOT auto-imported**; import them explicitly.
- Use `<NuxtLink to="...">` for in-app navigation, not `<a @click>`.
- Auth-gated routes are guarded by `app/middleware/auth.global.ts` against the public-paths allowlist.

# Deferred (don't refactor unless asked)

- SSR enablement (cookie-based auth, per-page middleware, `routeRules`).
- Server-side SAS token generation for blob storage.
