# Kinoplatform — Frontend

A production web app for the film industry: crew and casting directories, a
shooting-location marketplace with booking requests, availability calendars,
and an industry announcements board.

Nuxt 4 SPA (`ssr: false`) on Vue 3 + Vuetify 3 + Pinia, fully bilingual
(Armenian / English). It talks to a NestJS + MongoDB API that lives in a
separate, private repository — see [ARCHITECTURE.md](./ARCHITECTURE.md) for how
the two halves fit together and what the backend does.

> **Status:** pre-launch. Designed and built solo — architecture, API contract,
> design system, and infrastructure.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Nuxt 4 (`ssr: false`, SPA) · Vue 3 · TypeScript (strict) |
| UI | Vuetify 3 with a custom SCSS theme layer |
| State | Pinia (options-style stores) |
| i18n | `@nuxtjs/i18n` + vue-i18n — `en` / `hy`, no URL prefix |
| Maps / media | Leaflet, `vue-advanced-cropper` |
| Tooling | ESLint (`@nuxt/eslint`, stylistic), `vue-tsc` |

Node 22.12+ (the repo pins Node 24 via `.nvmrc` — `@nuxt/eslint` needs
`Object.groupBy`).

## Running it

```bash
nvm use && npm install
```

```bash
npm run dev
```

The dev server runs on port **5173**. Point it at an API with
`NUXT_PUBLIC_API_URL`; it defaults to the production URL in `nuxt.config.ts`.

```bash
npm run lint && npm run typecheck
```

Type errors and lint failures are the contract — there is no test suite on the
frontend (the API carries the automated tests).

## Layout

`app/` is Nuxt's `srcDir`.

```
app/
  pages/            file-based routes
  layouts/          default.vue, hero.vue
  components/       auto-imported; subdir = prefix (auth/Login.vue → <AuthLogin>)
  stores/           Pinia, one per domain
  composables/      useAppLocale, usePopupForm, useResizeObserver
  utils/            api client, error mapping, domain helpers
  middleware/       auth.global.ts — the single route guard
  plugins/          client-only: icons, locale restore, SPA redirect
shared/types/       API contract types, imported as ~~/shared/types/...
i18n/locales/       en.json / hy.json, kept at key parity
styles/             build-time SCSS injected into every component
design-system/      Vuetify theme tokens
```

`components/`, `stores/`, `composables/`, `utils/` and Vue's own APIs are
auto-imported. **Types are not** — import those explicitly.

## Conventions

### Talking to the API

All HTTP goes through two helpers in [`app/utils/api.ts`](./app/utils/api.ts).
Both expose `.get<T>()`, `.post<T>(body)`, `.patch<T>(body)`, `.delete<T>(body)`,
send the auth cookie automatically, transparently retry once on a 401 (token
refresh), and **never throw**.

| Helper | Returns | When |
| --- | --- | --- |
| **`apiRequest(path, opts?)`** | `T \| null` (`null` on error) | The default. Shows an error snackbar on failure; callers never `try/catch`. |
| **`useApi(path)`** | `ApiResult<T> = { data, error, status }` | Escape hatch — only when the caller needs the raw `error` for control flow or inline display. |

`apiRequest` options: `{ errorMessage?, showError? = true, successMessage?, loader? = false }`.
`loader: true` shows the global spinner; `errorMessage`/`successMessage` are
**i18n keys**.

Calls live in **Pinia store actions**, which own the request and return the result:

```ts
// app/stores/user.ts
async getAllUsers() {
  return apiRequest('/users/search', {
    loader: true,
    errorMessage: 'error_load_users_failed',
  }).get<User[]>();
}
```

```ts
// component
const users = (await userStore.getAllUsers()) ?? [];
```

Only `auth.login` and `auth.verifyEmail` use the raw `useApi` — the first
branches on `error.code`, the second renders the error inline — because a
snackbar alone can't express those.

### Error handling & localization

The API returns one envelope for every failure:

```json
{ "statusCode": 403, "code": "EMAIL_NOT_VERIFIED", "message": "…", "errors": {} }
```

`code` is the stable contract; `message` is an English developer string and is
**never** shown as the source of truth. The flow:

1. `apiFetch` surfaces the envelope as `ApiError` (`{ message, code?, errors? }`).
2. [`app/utils/apiErrors.ts`](./app/utils/apiErrors.ts) maps each `code` → an
   i18n key via `ERROR_MESSAGE_KEYS`; `apiErrorMessageKey(error)` resolves it
   (mapped key → raw `message` fallback during migration → `common_unexpected_error`,
   with a dev-only warning for unmapped codes).
3. `apiRequest` runs failures through that resolver and calls
   `appStore.showMessage(key, 'error')`.
4. [`Message.vue`](./app/components/Message.vue) and `Input` error slots
   translate keys with `t()`.

`appStore.showMessage(key, type, { variables? })` always takes an **i18n key**
(a non-key string passes through `t()` unchanged). Never pass English literals.

### Adding an endpoint

1. Add a store action calling `apiRequest('/path', opts).<method><T>(body)`
   (`<T>` from `~~/shared/types`); mutate state if needed, then `return` the result.
2. For each new API `code`, add `CODE → 'i18n_key'` to `ERROR_MESSAGE_KEYS`.
3. Add every new key to **both** `en.json` and `hy.json` — they are kept at
   exact parity.
4. Call the action from the component and check the return (`if (!data) return;`).

### Code style

- Pinia stores are options-style; inside an action reach other actions/state via
  `this.`. Read state directly (`authStore.user`), not through getters.
- `type` for every type definition. `interface` only when a class will
  `implements` it, and then prefixed `I`.
- `<NuxtLink to="…">` for in-app navigation, never `<a @click>`.
- Comments explain *why*, in one or two lines. The code says what.

## License

Source-available for review purposes. Not licensed for redistribution or
commercial use.
