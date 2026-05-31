# Kinoplatform — Frontend

Nuxt 4 SPA (`ssr: false`) on Vuetify + Pinia, talking to the NestJS
`kinoplatform-backend`. Vuetify scaffolding docs are further down; this section
covers the conventions specific to this app. For the agent-facing summary, see
[`CLAUDE.md`](./CLAUDE.md).

## Talking to the API

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

Calls live in **Pinia store actions** (options-style: `defineStore('x', { state, actions })`),
which own the request and return the result:

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

## Error handling & localization

The backend returns a single envelope for every failure:

```json
{ "statusCode": 403, "code": "EMAIL_NOT_VERIFIED", "message": "…", "errors": { } }
```

`code` is the stable contract; `message` is an English developer string and is
**not** shown as the source of truth. The flow:

1. `apiFetch` surfaces the envelope as `ApiError` (`{ message, code?, errors? }`).
2. [`app/utils/apiErrors.ts`](./app/utils/apiErrors.ts) maps each `code` → an
   i18n key via `ERROR_MESSAGE_KEYS`; `apiErrorMessageKey(error)` resolves it
   (mapped key → raw `message` fallback during migration → `common_unexpected_error`,
   with a dev-only warning for unmapped codes).
3. `apiRequest` runs failures through that resolver and calls
   `appStore.showMessage(key, 'error')`.
4. [`Message.vue`](./app/components/Message.vue) and `Input` error slots
   translate keys with `t()`, so the user sees localized text.

`appStore.showMessage(key, type, { variables? })` always takes an **i18n key**
(a non-key string passes through `t()` unchanged). Never pass English literals.

## Adding a new endpoint (end to end)

**Backend** (`kinoplatform-backend`): add the DTO + controller route + service
method, and throw `HttpException`s with explicit `{ code, message }`. See that
repo's README → *Error Handling*.

**Frontend:**

1. Add a store action calling `apiRequest('/path', opts).<method><T>(body)`
   (`<T>` from `~~/shared/types`); mutate state if needed, then `return` the result.
2. For each new backend `code`, add `CODE → 'i18n_key'` to `ERROR_MESSAGE_KEYS`
   in `app/utils/apiErrors.ts`.
3. Add every new key (errors, success, override copy) to **both**
   `i18n/locales/en.json` and `hy.json` — keep them at parity.
4. Call the action from the component; check the return (`if (!data) return;`).
   Use `useApi` only if you must branch on `error.code` or show the error inline.

---

# Vuetify (Default)

This is the official scaffolding tool for Vuetify, designed to give you a head start in building your new Vuetify application. It sets up a base template with all the necessary configurations and standard directory structure, enabling you to begin development without the hassle of setting up the project from scratch.

## ❗️ Important Links

- 📄 [Docs](https://vuetifyjs.com/)
- 🚨 [Issues](https://issues.vuetifyjs.com/)
- 🏬 [Store](https://store.vuetifyjs.com/)
- 🎮 [Playground](https://play.vuetifyjs.com/)
- 💬 [Discord](https://community.vuetifyjs.com)

## 💿 Install

Set up your project using your preferred package manager. Use the corresponding command to install the dependencies:

| Package Manager                                                | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |
| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |
| [pnpm](https://pnpm.io/installation)                          | `pnpm install` |
| [bun](https://bun.sh/#getting-started)                        | `bun install`  |

After completing the installation, your environment is ready for Vuetify development.

## ✨ Features

- 🖼️ **Optimized Front-End Stack**: Leverage the latest Vue 3 and Vuetify 3 for a modern, reactive UI development experience. [Vue 3](https://v3.vuejs.org/) | [Vuetify 3](https://vuetifyjs.com/en/)
- 🗃️ **State Management**: Integrated with [Pinia](https://pinia.vuejs.org/), the intuitive, modular state management solution for Vue.
- 🚦 **Routing and Layouts**: Utilizes Vue Router for SPA navigation and vite-plugin-vue-layouts-next for organizing Vue file layouts. [Vue Router](https://router.vuejs.org/) | [vite-plugin-vue-layouts-next](https://github.com/loicduong/vite-plugin-vue-layouts-next)
- 💻 **Enhanced Development Experience**: Benefit from TypeScript's static type checking and the ESLint plugin suite for Vue, ensuring code quality and consistency. [TypeScript](https://www.typescriptlang.org/) | [ESLint Plugin Vue](https://eslint.vuejs.org/)
- ⚡ **Next-Gen Tooling**: Powered by Vite, experience fast cold starts and instant HMR (Hot Module Replacement). [Vite](https://vitejs.dev/)
- 🧩 **Automated Component Importing**: Streamline your workflow with unplugin-vue-components, automatically importing components as you use them. [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- 🛠️ **Strongly-Typed Vue**: Use vue-tsc for type-checking your Vue components, and enjoy a robust development experience. [vue-tsc](https://github.com/johnsoncodehk/volar/tree/master/packages/vue-tsc)

These features are curated to provide a seamless development experience from setup to deployment, ensuring that your Vuetify application is both powerful and maintainable.

## 💡 Usage

This section covers how to start the development server and build your project for production.

### Starting the Development Server

To start the development server with hot-reload, run the following command. The server will be accessible at [http://localhost:3000](http://localhost:3000):

```bash
yarn dev
```

(Repeat for npm, pnpm, and bun with respective commands.)

> Add NODE_OPTIONS='--no-warnings' to suppress the JSON import warnings that happen as part of the Vuetify import mapping. If you are on Node [v21.3.0](https://nodejs.org/en/blog/release/v21.3.0) or higher, you can change this to NODE_OPTIONS='--disable-warning=5401'. If you don't mind the warning, you can remove this from your package.json dev script.

### Building for Production

To build your project for production, use:

```bash
yarn build
```

(Repeat for npm, pnpm, and bun with respective commands.)

Once the build process is completed, your application will be ready for deployment in a production environment.

## 💪 Support Vuetify Development

This project is built with [Vuetify](https://vuetifyjs.com/en/), a UI Library with a comprehensive collection of Vue components. Vuetify is an MIT licensed Open Source project that has been made possible due to the generous contributions by our [sponsors and backers](https://vuetifyjs.com/introduction/sponsors-and-backers/). If you are interested in supporting this project, please consider:

- [Requesting Enterprise Support](https://support.vuetifyjs.com/)
- [Sponsoring John on Github](https://github.com/users/johnleider/sponsorship)
- [Sponsoring Kael on Github](https://github.com/users/kaelwd/sponsorship)
- [Supporting the team on Open Collective](https://opencollective.com/vuetify)
- [Becoming a sponsor on Patreon](https://www.patreon.com/vuetify)
- [Becoming a subscriber on Tidelift](https://tidelift.com/subscription/npm/vuetify)
- [Making a one-time donation with Paypal](https://paypal.me/vuetify)

## 📑 License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present Vuetify, LLC
