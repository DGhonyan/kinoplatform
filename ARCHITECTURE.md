# Architecture

Kinoplatform is two repositories and three cloud providers. This one holds the
frontend. The API is a separate **private** repository — this document exists so
that reading the frontend alone still tells you what the whole system does and
why it's shaped this way.

```
                    ┌─────────────────────────┐
   browser ────────▶│  Nuxt 4 SPA             │   Cloudflare Pages
                    │  (this repository)      │
                    └───────────┬─────────────┘
                                │  REST + httpOnly cookie
                                ▼
                    ┌─────────────────────────┐
                    │  NestJS 11 API          │   Google Cloud Run
                    │  (private repository)   │
                    └───┬─────────────────┬───┘
                        │                 │
                        ▼                 │ SAS token
                 ┌─────────────┐          │ (mint only)
                 │  MongoDB    │          │
                 │  Atlas      │          ▼
                 └─────────────┘   ┌──────────────────┐
                                   │ Azure Blob       │◀── browser uploads
                                   │ Storage          │    bytes directly
                                   └──────────────────┘
```

## Why the split

The frontend is a pure SPA (`ssr: false`) served as static files from
Cloudflare's edge. It holds no secrets, runs no server, and can be cached
globally. Every piece of privileged logic — authorization, validation,
persistence, media signing — lives behind the API.

The API is private because it carries the authentication and authorization
design, the rate-limit configuration, and the data model. The frontend is
readable without it: the contract between them is fully described by
[`shared/types/`](./shared/types) and the error-code table in
[`app/utils/apiErrors.ts`](./app/utils/apiErrors.ts).

## The backend, in brief

A **modular monolith** in NestJS 11 over MongoDB/Mongoose. Modules map to
domains — `auth`, `user`, `account`, `location`, `availability`, `announcement`,
`recommendation`, `files`, `graph` — with a shared `common` layer holding
schemas, repositories and cross-cutting utilities.

Monolith over microservices deliberately: the module boundaries make a future
service split cheap, while a single deployable keeps operational cost near zero
for a solo team. Nine collections back it: `user`, `credentials`, `connection`,
`location`, `booking-request`, `availability`, `announcement`, `recommendation`,
`file`.

### Request pipeline

Every request passes four global guards, in order:

```
ThrottlerGuard → JwtAuthGuard → RolesGuard → MfaGuard
```

Auth is **deny-by-default**: a route is protected unless it opts out with
`@Public()`. Critically, `@Public()` means *authentication is optional*, not
*skipped* — the JWT is still parsed when present, so a public page can
recognize a signed-in owner and serve them their own data instead of the
anonymous view. Getting that wrong is subtle and costly: the naive
"short-circuit on public" implementation makes owners invisible to their own
profile endpoint.

Validation runs through a global `ValidationPipe` with `whitelist: true` and
`forbidNonWhitelisted: true`, so an unrecognized body field is a 400 rather
than a silently ignored one.

### Authentication

- Short-lived JWT access token + refresh token, delivered as httpOnly cookies —
  the SPA never touches token values, and the refresh round-trip is invisible to
  calling code (see `apiFetch`'s 401 retry).
- Credentials live in their **own collection**, separate from profile documents,
  so no profile query can surface an auth secret by accident.
- TOTP multi-factor with recoverable backup codes, enforced by `MfaGuard` on
  routes marked `@RequireMfa()`.
- `passwordChangedAt` is checked on every token validation, so a password change
  invalidates outstanding tokens without a revocation list.
- Destructive account operations (export, erasure) sit behind step-up
  re-authentication.

### Response serialization

Responses are built by an explicit allowlist, not by omission. Every DTO field
carries `@Expose()`, and `plainToDto` strips everything else. Profiles have two
DTOs — an owner view and a public view — where the public one deliberately does
**not** extend the owner one, so adding a PII field to the model can never leak
it through an endpoint that predates the field.

ObjectId fields carry an `@OidToString()` decorator. This is load-bearing:
without it, class-transformer deep-transforms the ObjectId's internal buffer and
mints a *new*, plausible-looking id — the API returns 200s full of ids that
resolve to nothing. There's a regression test pinned to that behavior.

### Media

Uploads never transit the API. The client asks for a short-lived, narrowly
scoped Azure SAS token (create + write, one blob path), `PUT`s the bytes
straight to Blob Storage, then calls back to confirm. Files move through a
two-phase `pending → confirmed` lifecycle, and a TTL index with a partial filter
reaps never-confirmed rows — the expiry window comfortably exceeds the SAS
lifetime, so a slow-but-valid upload still lands.

All Azure access sits behind one `IAzureBlobService` interface, so moving from
account-key SAS to Entra ID user-delegation SAS changes exactly one class.

### Privacy

Data-portability export and right-to-erasure are first-class endpoints. Erasure
cascades across every collection referencing the user *and* deletes their blobs;
export deliberately excludes password hashes, MFA secrets, token hashes and
verification codes.

## The contract between the halves

**Types.** [`shared/types/`](./shared/types) mirrors the API's response DTOs.
They're hand-maintained rather than generated — small enough that the coupling
cost is lower than a codegen pipeline's.

**Errors.** Every failure is one envelope:

```json
{ "statusCode": 403, "code": "EMAIL_NOT_VERIFIED", "message": "…", "errors": {} }
```

`code` is the stable, machine-readable contract. `message` is an English
developer string that is never rendered to a user. The frontend maps every
user-facing `code` to an i18n key; unmapped codes fall back to a generic message
and warn in development. `errors` carries per-field detail when
`code === 'VALIDATION_ERROR'`.

This is the piece that makes a bilingual app tractable. If the API returned
prose, every user-visible string would be pinned to the server's language and
untranslatable at the edge.

**Auth.** Cookies, set by the API, sent automatically. The SPA's only auth state
is a cached user object plus a local marker used to decide whether an anonymous
visitor is worth a `/me` round-trip.

## Frontend structure

A single global middleware ([`auth.global.ts`](./app/middleware/auth.global.ts))
guards routes against a public-path allowlist, bounces guests to login with a
`?redirect=` return path, and pins users with incomplete onboarding to the
onboarding route. Gated pages always validate the session; public pages only do
so when a local signal suggests one exists, so anonymous visitors never pay for
a `/me` call.

State is one Pinia store per domain. Stores own API calls and return results;
components decide what to render. No component calls `apiRequest` directly.

The design system is a thin layer over Vuetify: theme tokens in
`design-system/colors.ts`, SCSS variables and breakpoint mixins injected into
every component at build time, and wrapper components (`Input`, `Select`,
`TextArea`, `Button`) that centralize the props Vuetify would otherwise have
repeated at every call site.

## Deployment

| Piece | Where | Why |
| --- | --- | --- |
| SPA | Cloudflare Pages | Static, edge-cached, zero server cost |
| API | Google Cloud Run | Scale-to-zero; no idle cost between demos |
| Database | MongoDB Atlas | Managed, with the flexible schema the profile model wants |
| Media | Azure Blob Storage | Direct client upload via SAS; bytes bypass the API |

Three providers is a deliberate trade rather than an accident: each piece sits
on the platform where its cost curve is best, and the coupling between them is
thin enough (a CORS origin, a SAS-minting credential) that any one could move.

Scale-to-zero is worth watching. A `minScale: 1` annotation set at the *service*
level — invisible to the revision template most tooling inspects — tripled the
daily cost by keeping one instance permanently warm. The delta worked out to
exactly one vCPU-day, which is what identified it.
