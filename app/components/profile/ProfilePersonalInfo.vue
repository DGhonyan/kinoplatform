<template>
  <section class="personal-card">
    <div class="personal">
      <div class="personal-top">
        <div class="identity">
          <div class="name-row">
            <h1 class="name">
              {{ user?.firstName }} {{ user?.lastName }}
            </h1>
            <Button
              v-if="canEdit"
              icon="mdi-pencil"
              variant="text"
              size="small"
              :aria-label="$t('profile_edit_personal_info')"
              @click="emit('editInfo')"
            />
          </div>
          <span
            v-if="professionsText"
            class="professions"
          >{{ professionsText }}</span>
          <span
            v-if="user?.experienceLevel"
            class="experience-level"
          >{{ $t(user.experienceLevel) }}</span>
        </div>
      </div>

      <p
        v-if="user?.bio"
        class="bio"
      >
        {{ user.bio }}
      </p>

      <ProfileSectionNav
        v-if="navSections.length"
        :sections="navSections"
      />

      <div class="meta">
        <div
          v-if="user?.location"
          class="meta-line"
        >
          <v-icon size="18">
            custom:map-pin
          </v-icon>
          <span>{{ user.location }}</span>
        </div>
        <div
          v-if="user?.education"
          class="meta-line"
        >
          <v-icon size="18">
            custom:graduation-cap
          </v-icon>
          <span>{{ user.education }}</span>
        </div>
        <a
          v-if="portfolioUrl"
          class="meta-line portfolio"
          :href="portfolioUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-icon size="18">mdi-link-variant</v-icon>
          <span>{{ $t('common_portfolio_link') }}</span>
        </a>
      </div>

      <ProfileChipGroup
        v-if="hasLanguages"
        :label="isMe ? 'would you be' : $t('common_languages')"
        :items="languageNames"
      />

      <ProfileChipGroup
        v-if="hasTools || hasEquipment || canEdit"
        :label="isMe ? 'the beaten and the damned' : $t('gear_title')"
        :items="gearItems"
        :editable="canEdit && (hasTools || hasEquipment)"
        :add-label="canEdit ? $t('gear_add_cta') : undefined"
        @edit="emit('editGear')"
        @add="emit('editGear')"
      />

      <ProfileChipGroup
        v-if="enabledPracticalities.length"
        :label="$t('gear_practicalities_label')"
        :items="practicalityLabels"
        :editable="canEdit"
        @edit="emit('editGear')"
      />

      <!-- Appearance is owner-only, never public — it powers casting filters. -->
      <div
        v-if="canEdit && isActorProfile"
        class="appearance-owner"
      >
        <div class="appearance-owner-head">
          <span class="appearance-owner-label">{{ $t('appearance_title') }}</span>
          <Button
            variant="text"
            size="small"
            :prepend-icon="appearanceSet ? 'mdi-pencil' : 'mdi-plus'"
            color="accent"
            @click="emit('editAppearance')"
          >
            {{ appearanceSet ? $t('common_edit') : $t('common_add') }}
          </Button>
        </div>
        <span class="appearance-owner-note">
          <v-icon size="14">
            mdi-eye-off-outline
          </v-icon>
          {{ $t('appearance_private_note') }}
        </span>
      </div>
    </div>

    <div class="side">
      <div
        v-if="user?.avatar"
        class="avatar"
      >
        <img
          :src="getUserAvatar()"
          alt=""
        >
      </div>
      <Button
        class="availability-btn"
        color="primary"
        text-color="white"
        block
        append-icon="custom:calendar"
        @click="emit('openAvailability')"
      >
        {{ $t('profile_availability') }}
      </Button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { Practicalities } from '~~/shared/types/user';
import type { UserProfile } from '~/stores/user';
import { getLanguageDisplayName } from '~/utils/languages';
import { isActor } from '~/utils/persona';
import { isAppearanceComplete } from '~/utils/appearance';
import { safeExternalUrl } from '~/utils/safeUrl';
import Button from '~/components/Button.vue';
import ProfileChipGroup from '~/components/profile/ProfileChipGroup.vue';
import ProfileSectionNav from '~/components/profile/ProfileSectionNav.vue';
import { DGHONYAN_EMAIL } from '~/utils/constants';

// Identity card: pure display derived from `user`; the owner's edit
// affordances emit up so the parent keeps owning the popups.
const props = defineProps<{
  user: UserProfile | null;
  canEdit: boolean;
  /** Visible profile sections to render as scroll-to tabs (built by the parent). */
  navSections: { id: string; label: string }[];
}>();

const emit = defineEmits<{
  editInfo: [];
  editGear: [];
  editAppearance: [];
  openAvailability: [];
}>();

const { t, locale } = useI18n();
const isMe = computed(() => props.user?.email === DGHONYAN_EMAIL);
const isActorProfile = computed(() => isActor(props.user?.profession));
const portfolioUrl = computed(() => safeExternalUrl(props.user?.portfolio));
const appearanceSet = computed(() => isAppearanceComplete(props.user?.appearance));

const professionsText = computed(() =>
  (props.user?.profession ?? []).map(p => t(p)).join(' | '),
);
const languageName = (code: string) => getLanguageDisplayName(code, locale.value) ?? code;

const getUserAvatar = () =>
  props.user?.avatar || new URL('@/assets/default.jpg', import.meta.url).href;

const hasLanguages = computed(() => (props.user?.languages?.length ?? 0) > 0);
const hasTools = computed(() => (props.user?.tools?.length ?? 0) > 0);
const hasEquipment = computed(() => (props.user?.equipment?.length ?? 0) > 0);

const PRACTICALITY_KEYS: (keyof Practicalities)[] = [
  'willingToTravel',
  'availableForLongShoots',
  'passportAvailable',
  'visaAvailable',
  'drivingLicenseAvailable',
];
const enabledPracticalities = computed(() =>
  PRACTICALITY_KEYS.filter(k => props.user?.practicalities?.[k]),
);

const languageNames = computed(() => (props.user?.languages ?? []).map(languageName));
const gearItems = computed(() => [
  ...(props.user?.tools ?? []),
  ...(props.user?.equipment ?? []),
]);
const practicalityLabels = computed(() =>
  enabledPracticalities.value.map(k => t(`practicality_${k}`)),
);
</script>

<style scoped lang="scss">
.personal-card {
  display: flex;
  gap: 24px;
  padding: 14px;
  justify-content: space-between;
}

.personal {
  // Flex items default to min-width:auto, letting wide text push the
  // fixed-width avatar off-screen; min-width:0 lets this column shrink.
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.personal-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid color(--v-theme-accent);
}

.identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.02em;
  margin: 0;
  overflow-wrap: anywhere;
}

.professions {
  font-size: 15px;
  color: color(--v-theme-accent);
  overflow-wrap: anywhere;
}

.experience-level {
  font-size: 13px;
  opacity: 0.7;
  overflow-wrap: anywhere;
}

.side {
  flex-shrink: 0;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar {
  width: 100%;
  height: 400px;
  border: 1px solid color(--v-theme-accent, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.availability-btn {
  margin-bottom: 10px;
  // Vuetify's `block` is `flex: 1 0 auto`, so in this stretched column the
  // button would swallow the leftover height; `min-width: 100%` keeps it full-width.
  flex-grow: 0;
}

.bio {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
  overflow-wrap: anywhere;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: inherit;
  text-decoration: none;

  .v-icon {
    flex-shrink: 0;
    opacity: 0.7;
  }

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
}

.portfolio {
  color: color(--v-theme-accent);
  width: fit-content;

  &:hover {
    text-decoration: underline;
  }
}

.appearance-owner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.appearance-owner-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.appearance-owner-label {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.85;
}

.appearance-owner-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.55;

  .v-icon {
    flex-shrink: 0;
  }
}

/* ── Mobile: one column, name → photo → professions → rule → the rest ── */
@include mobile {
  .personal-card {
    display: flex;
    flex-direction: column;
    // Lean on the layout's own gutter instead of insetting a second time.
    padding: 14px 0;
    gap: 14px;
  }

  // The photo must land between the name and the professions, which live in the
  // other desktop column — `display: contents` lets `order` interleave their children.
  .personal,
  .personal-top,
  .identity,
  .side {
    display: contents;
  }

  // Only the identity block is re-ordered (negatively, so everything else
  // keeps the default 0 and follows in DOM order).
  .name-row {
    order: -4;
  }

  .avatar {
    order: -3;
    width: 100%;
    // Portrait, centered, and inset from the page edge — not full-bleed.
    max-width: 280px;
    height: auto;
    margin-inline: auto;

    img {
      height: auto;
      aspect-ratio: 4 / 5;
    }
  }

  .professions {
    order: -2;
    font-size: 16px;
  }

  .experience-level {
    order: -1;
  }

  // `.personal-top` lost its box (and its closing rule) to `display: contents`;
  // a pseudo-element sorts ahead of order-0 siblings, landing right after the identity.
  .personal-card::before {
    content: '';
    height: 0;
    border-top: 1px solid color(--v-theme-accent);
  }

  .name {
    font-size: 34px;
  }
}
</style>
