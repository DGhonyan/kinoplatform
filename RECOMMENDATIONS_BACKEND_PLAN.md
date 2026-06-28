# Recommendations — backend plan

> **Status: ✅ Implemented** in `../kinoplatform-backend` (recommendation module,
> profile-response wiring, account-deletion cascade + GDPR export, error codes,
> service spec). Type-checks clean; full Jest suite passes. Kept as the design record.

A new feature: users can leave a short recommendation on another user's profile,
shown as a carousel of cards (author avatar + full name + text) on the profile.

## Decisions (already made on the frontend side)

- **250-char limit** on the text.
- **One recommendation per author per target**, editable — re-submitting overwrites
  the existing one (upsert on a unique `authorId + targetId`).
- **Both the author and the target can delete** a recommendation. (Target deletes
  spam/abuse on their profile; author retracts their own.)
- Author must be **onboarded** (`onboardingComplete: true`) and **cannot recommend
  themselves** (`authorId !== targetId`).

## New collection / schema

`src/common/schema/recommendation.schema.ts`:

```ts
@Schema({ timestamps: true }) // gives createdAt / updatedAt
export class Recommendation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  targetId: Types.ObjectId;

  @Prop({ required: true, maxlength: 250 })
  text: string;
}
export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);
// One recommendation per (author, target) — upsert target.
RecommendationSchema.index({ authorId: 1, targetId: 1 }, { unique: true });
```

## Module / files

A `recommendation` module mirroring the existing `event` module structure:
`recommendation.module.ts`, `recommendation.controller.ts`, `recommendation.service.ts`,
`dto/recommendation.dto.ts`, and a repository if the codebase uses the repository
pattern per domain (it does — see `common/repository/event.repository.ts`).

## DTOs (`src/recommendation/dto/recommendation.dto.ts`)

```ts
export class CreateRecommendationDto {
  @IsMongoId()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  text: string;
}

// Author summary embedded in the response (kept fresh by populating on read).
export class RecommendationAuthorDto {
  @Expose() @OidToString() _id: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() avatar: string;
}

export class RecommendationResponseDto {
  @Expose() @OidToString() _id: string;
  @Expose() @Type(() => RecommendationAuthorDto) author: RecommendationAuthorDto;
  @Expose() text: string;
  @Expose() createdAt: Date;
}
```

## Endpoints

### `POST /recommendations` (auth required)
Body: `CreateRecommendationDto`. `authorId` = current user (`@CurrentUser('sub')`).

- Reject if `authorId === targetId` → 400 `code: CANNOT_RECOMMEND_SELF`.
- Reject if the author is not `onboardingComplete` → 403 (reuse an existing
  forbidden code or add `ONBOARDING_INCOMPLETE`). Frontend already gates the UI,
  but enforce server-side.
- Optionally 404 if `targetId` is not a real/active user.
- **Upsert**: `findOneAndUpdate({ authorId, targetId }, { $set: { text } }, { upsert: true, new: true, setDefaultsOnInsert: true })`. The unique index makes this idempotent and race-safe.
- Return the saved recommendation populated with the author (`firstName lastName avatar`)
  as `RecommendationResponseDto`.

### `DELETE /recommendations/:id` (auth required)
- Load the recommendation; 404 if missing.
- Allow if `currentUser === recommendation.authorId` **or** `currentUser === recommendation.targetId`; else 403.
- Delete; return `{ message: 'Deleted' }` (or 204).

### Read — fold into the existing profile response (no new GET endpoint needed)
`GET /users/profile/:id` already assembles the profile (`user.controller.ts`
`getProfile` does `Promise.all([findById, eventService.findByUserId])`). Add the
recommendations there:

```ts
const [user, events, recommendations] = await Promise.all([
  this.userService.findById(id),
  this.eventService.findByUserId(id),
  this.recommendationService.findByTarget(id), // populated authors, sorted createdAt desc
]);
return plainToDto(UserProfileResponseDto, { ...user, events, recommendations });
```

`recommendationService.findByTarget(targetId)`:
`find({ targetId }).populate('authorId', 'firstName lastName avatar').sort({ createdAt: -1 })`,
then map each to the `{ _id, author, text, createdAt }` shape (the populated
`authorId` becomes `author`).

### `UserProfileResponseDto` — expose the array
Add to `src/user/dto/user.dto.ts`:
```ts
@Expose()
@Type(() => RecommendationResponseDto)
recommendations: RecommendationResponseDto[];
```

## Frontend contract (already built against this)

- Profile response includes `recommendations: Array<{ _id, author: { _id, firstName, lastName, avatar }, text, createdAt }>`, newest first.
- `POST /recommendations { targetId, text }` returns the single saved
  `RecommendationResponseDto`.
- `DELETE /recommendations/:id` returns success (any 2xx).
- The frontend uses `apiRequest` (never throws); a `null` return = failure, with a
  snackbar. Error `code`s should map to i18n keys, but during migration the raw
  message is tolerated.

## Checklist

- [ ] `Recommendation` schema + unique `{authorId, targetId}` index
- [ ] recommendation module/controller/service/repository/dto
- [ ] `POST /recommendations` upsert with self-check + onboarded-check
- [ ] `DELETE /recommendations/:id` author-or-target authorization
- [ ] `recommendationService.findByTarget` populating author, newest-first
- [ ] profile response includes `recommendations`
- [ ] `UserProfileResponseDto.recommendations` exposed
- [ ] error codes (`CANNOT_RECOMMEND_SELF`, onboarding-incomplete) added to the codes file + frontend `apiErrors.ts` mapping (coordinate keys)
