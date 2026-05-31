# Verifying changes

Use Node 22.12+ (this repo pins Node 24 via `.nvmrc`). Run `nvm use` before commands if your shell isn't already on it — `@nuxt/eslint` needs `Object.groupBy`, which Node 20 doesn't have.

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

- Pinia stores are options-style: `defineStore('name', { state: () => ({ ... }), actions: { ... } })`. Inside an action, reach other actions/state via `this.` (`this.user`, `this.setUser(...)`). Read state directly (`authStore.user`), not via getters. Private non-reactive internals can be module-level `let`s above `defineStore` (see `auth.ts`'s init guards).
- API calls go through the helpers in `app/utils/api.ts`. Default to `apiRequest`; drop to `useApi` only when the caller needs the raw error. See "Calling the API & handling errors" below. Base URL comes from `runtimeConfig.public.apiUrl`.
- Don't import `ref`, `computed`, `watch`, `useRoute`, `useRouter`, `navigateTo`, `storeToRefs`, store hooks, or utils — they're auto-imported. **Types are NOT auto-imported**; import them explicitly.
- Use `type` for all type definitions — data shapes, unions, aliases, function signatures. Reach for `interface` only when a class will `implements` it (classes can implement interfaces, not type aliases). When you do declare an interface, prefix its name with `I` (e.g. `IUserRepository`) so it's visually distinct from the `type`-based shapes that fill the rest of the codebase.
- Use `<NuxtLink to="...">` for in-app navigation, not `<a @click>`.
- Auth-gated routes are guarded by `app/middleware/auth.global.ts` against the public-paths allowlist.

# Calling the API & handling errors

Two helpers wrap `$fetch`, both in `app/utils/api.ts`. Both expose
`.get<T>()`, `.post<T>(body)`, `.patch<T>(body)`, `.delete<T>(body)`, send the
auth cookie automatically, and **never throw** (`apiFetch` catches everything,
including the 401-refresh retry).

- **`apiRequest(path, opts?)` — the default.** Returns `T | null` (`null` on
  error). On failure it shows an error snackbar; callers never `try/catch`.
  Options: `{ errorMessage?: i18nKey, showError? = true, successMessage?: i18nKey, loader? = false }`.
  `loader: true` wraps the call in the global spinner; `errorMessage`/`successMessage`
  are **i18n keys**, not English.
- **`useApi(path)` — raw escape hatch.** Returns `ApiResult<T> = { data, error, status }`.
  Use **only** when the caller consumes `error` for control flow or inline
  display (not just a snackbar). Today that is exactly `auth.login` (branches on
  `error.code === 'EMAIL_NOT_VERIFIED'`) and `auth.verifyEmail` (renders an
  inline field error). Everything else uses `apiRequest`.

Store actions own the call and return its result:

```ts
async getAllUsers() {
  return apiRequest('/users/search', { loader: true, errorMessage: 'error_load_users_failed' }).get<User[]>();
}
```

**Error contract.** The backend returns `{ statusCode, code, message, errors? }`.
`code` is the stable, machine-readable contract; `message` is an English
developer string — **never display it as the source of truth**. Map every
user-facing `code` → i18n key in `app/utils/apiErrors.ts`; `apiErrorMessageKey(error)`
resolves it (mapped key → raw `message` fallback during migration → `common_unexpected_error`,
with a dev-only warning on unmapped codes). `apiRequest` runs failures through it
automatically. `error.errors` carries per-field detail when `code === 'VALIDATION_ERROR'`.

**Snackbars are i18n keys.** `appStore.showMessage(key, 'success' | 'error', { variables? })`.
`Message.vue` translates the key via `t()` (a non-key string passes through
unchanged). Pass keys, never English literals.

# Adding a new endpoint (frontend side)

1. Add an action to the relevant `app/stores/*.ts` that calls
   `apiRequest('/path', opts).<method><T>(body)`, where `<T>` is the success
   payload type (from `~~/shared/types`). Mutate state if needed
   (`this.setUser(...)`), then `return` the result.
2. If the endpoint introduces a new backend `code`, add `CODE → 'i18n_key'` to
   `ERROR_MESSAGE_KEYS` in `app/utils/apiErrors.ts`.
3. Add every new key (error, success, override copy) to **both**
   `i18n/locales/en.json` and `hy.json` — keep them at parity.
4. Call the action from the component and check the return (`if (!data) return;`).
   Reach for `useApi` only if you must branch on `error.code` or show the error
   inline.

# Deferred (don't refactor unless asked)

- SSR enablement (cookie-based auth, per-page middleware, `routeRules`).
- Server-side SAS token generation for blob storage.
