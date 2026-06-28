# Onboarding backend plan

> **STATUS: IMPLEMENTED** (constants, schema, DTOs, service, migration script, tests).
> `npm run typecheck` passes; `user.service.spec.ts` + `auth.service.spec.ts` green (67 tests).
> Run `npm run migrate:onboarding` against the target DB to backfill existing users.
> This doc is kept as the design record / checklist.

Backend changes for the redesigned onboarding flow, in `../kinoplatform-backend`. The frontend was built against this contract.

## Context

Onboarding moved from one long 8-step wizard to a **5-step wizard** plus **3 profile-page popups**:

| # | Where    | Step id (`completeStep`) | Collects                                   | Required? |
| - | -------- | ------------------------ | ------------------------------------------ | --------- |
| 1 | wizard   | `credentials`            | email, password                            | ✅ (gate) |
| 2 | wizard   | `code`                   | 6-digit email code                         | ✅ (gate) |
| 3 | wizard   | `name`                   | firstName, lastName, **gender**            | ✅ (gate) |
| 4 | wizard   | `location`               | location, birthDate                        | ✅ (gate) |
| 5 | wizard   | `profession`             | profession[]                               | ✅ (gate) |
| 6 | popup    | `essentials`             | avatar, bio, languages                     | ✅ (gate) |
| 7 | popup    | `background_details`     | education, portfolio, projects, experience | optional  |
| 8 | popup    | `gear`                   | tools, equipment, practicalities           | optional  |

Everything still flows through the existing `PATCH /users/update` with a `completeStep` field — **no new endpoints**. Steps 1–2 stay on `/auth/register` + `/auth/verify-email` as today.

## 0. Split `active` into `active` + `onboardingComplete`

Today `active` overloads "finished onboarding" and "account in good standing," which blocks any future soft-delete / admin-disable. Split:

- **`active: boolean`** — account status. **Default `true`** for new sign-ups. Reserved for admin disable / soft-delete. Stays the visibility filter for search/listing (`{ active: true }`).
- **`onboardingComplete: boolean`** — derived; **default `false`**, set `true` once every `REQUIRED_ONBOARDING_STEPS` id is in `completedSteps`. This is the onboarding gate the frontend reads.

Rename the existing `completeStepAndActivate(user, completeStep)` (in `src/user/user.service.ts`) to something like `completeStepAndMaybeFinishOnboarding`. It pushes the step (idempotent) and flips **`onboardingComplete`** (never `active`) when the required set is satisfied.

`REQUIRED_ONBOARDING_STEPS` (keep in sync with the frontend's copy in `app/components/auth/registerSteps.ts`):

```
['credentials', 'code', 'name', 'location', 'profession', 'essentials']
```

Update `ONBOARDING_STEPS` (or equivalent enum/const) to the new ids: add `location`, `profession`, `essentials`, `background_details`, `gear`; drop the old `background`, `expertise`, `avatar`, `bio`, `portfolio` (the project has effectively no real users, so a clean rename is fine).

## 1. Schema additions (`src/common/schema/user.schema.ts`)

```ts
@Prop({ default: false }) onboardingComplete: boolean;
@Prop({ default: true })  active: boolean;          // flip default false → true

@Prop({ type: String, enum: ['male', 'female', 'other'], default: null })
gender: 'male' | 'female' | 'other' | null;

@Prop({ type: [String], default: [] }) equipment: string[];

@Prop({ type: [ExperienceSchema], default: [] }) experience: Experience[];
@Prop({ type: PracticalitiesSchema, default: () => ({}) }) practicalities: Practicalities;
```

New sub-schemas:

```ts
@Schema({ _id: false })
class Experience {
  @Prop({ required: true }) position: string;        // free text
  @Prop({ required: true }) company: string;
  @Prop({ required: true }) employmentType: string;  // 'employment_full_time' | 'employment_part_time' | 'employment_freelance' | 'employment_contract' | 'employment_internship'
  @Prop({ required: true }) startYear: number;
  @Prop({ required: true, min: 1, max: 12 }) startMonth: number;
  @Prop() endYear?: number;
  @Prop({ min: 1, max: 12 }) endMonth?: number;
  @Prop({ default: false }) currentlyWorking: boolean;
  @Prop({ default: '' }) description: string;
}

@Schema({ _id: false })
class Practicalities {
  @Prop({ default: false }) willingToTravel: boolean;
  @Prop({ default: false }) availableForLongShoots: boolean;
  @Prop({ default: false }) passportAvailable: boolean;
  @Prop({ default: false }) visaAvailable: boolean;
  @Prop({ default: false }) drivingLicenseAvailable: boolean;
}
```

> **String-value note.** The frontend stores `employmentType` and project `type` as the **i18n key strings** (`employment_full_time`, `production_short_film`, …) and `profession`/project `position` as profession ids (`profession_director`, …). Treat them as opaque strings — don't enum-validate against a hardcoded list unless you want to mirror the frontend constants exactly.

## 2. Project sub-schema reshape

The existing `Project` ({ name, year, link }) gains fields:

```ts
@Prop({ required: true }) name: string;
@Prop({ required: true }) type: string;       // production type id, e.g. 'production_short_film'
@Prop({ required: true }) position: string;   // profession id, e.g. 'profession_director'
@Prop({ required: true }) year: number;
@Prop({ required: true, min: 1, max: 12 }) month: number;
@Prop() link?: string;                         // now optional
@Prop({ default: '' }) description: string;
```

## 3. DTO updates (`src/user/dto/user.dto.ts`)

`UpdateUserDto` — add optional, validated:

- `gender?: 'male' | 'female' | 'other'` — `@IsOptional() @IsEnum([...])`
- `equipment?: string[]` — `@IsOptional() @IsArray() @IsString({ each: true })`
- `experience?: ExperienceDto[]` — `@ValidateNested({ each: true }) @Type(() => ExperienceDto)`
- `practicalities?: PracticalitiesDto` — `@ValidateNested() @Type(() => PracticalitiesDto)`
- `projects?: ProjectDto[]` — extend `ProjectDto` with `type`, `position`, `month` (1–12), optional `link`, optional `description`
- `completeStep?: string` — already present; now also accepts `location`, `profession`, `essentials`, `background_details`, `gear`

New `ExperienceDto` / `PracticalitiesDto` classes mirror the sub-schemas. For experience, optionally enforce `endYear`/`endMonth` required when `currentlyWorking === false` and that end ≥ start (frontend already does, but don't trust it).

`UserResponseDto` — surface `onboardingComplete`, `gender`, `equipment`, `experience`, `practicalities`, and the reshaped `projects`. (`active`, `completedSteps` already there.)

## 4. Auth service (`src/auth/auth.service.ts`)

Unchanged in spirit: `register` still pushes `credentials`, `verifyEmail` still pushes `code`. Just confirm the new-user document is created with `active: true`, `onboardingComplete: false`.

## 5. Migration (one-shot, dev data only)

No versioned migration needed — effectively no real users. A `db.users.updateMany` is enough:

- For every user: set `active: true`.
- `onboardingComplete`: `true` if the user was previously `active === true` (old "onboarded" meaning), else `false`.
- Optionally backfill `completedSteps` for previously-active users to the full required set so they aren't re-prompted. Initialize `equipment: []`, `experience: []`, `practicalities: {}`, `gender: null`. Existing `projects` missing the new required fields should be defaulted or dropped (dev data — dropping is fine).

## Sanity checklist

- [ ] `onboardingComplete` added (default false); `active` default flipped to `true`
- [ ] `gender`, `equipment`, `experience[]`, `practicalities` added to schema (+ sub-schemas)
- [ ] `Project` reshaped (type, position, month, optional link, description)
- [ ] `completeStepAndActivate` → flips `onboardingComplete`, never `active`; `REQUIRED_ONBOARDING_STEPS` updated to the 6 ids
- [ ] `register` / `verifyEmail` still push `credentials` / `code`; new users get `active: true`, `onboardingComplete: false`
- [ ] `UpdateUserDto` accepts the new fields with validation; `completeStep` accepts the new ids
- [ ] `UserResponseDto` exposes `onboardingComplete`, `gender`, `equipment`, `experience`, `practicalities`, reshaped `projects`
- [ ] One-shot backfill run on dev data

## Verifying against the frontend

After shipping, `/users/me` should return `onboardingComplete`, `gender`, `equipment`, `experience`, `practicalities`, and reshaped `projects`. A brand-new user: `active: true`, `onboardingComplete: false`. The frontend tolerates the pre-ship state (derives onboarding completeness from `completedSteps` when `onboardingComplete` is absent), so frontend and backend can land independently — but the optional-popup fields won't persist until this lands.
