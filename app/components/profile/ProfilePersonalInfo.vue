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
          v-if="user?.portfolio"
          class="meta-line portfolio"
          :href="user.portfolio"
          target="_blank"
        >
          <v-icon size="18">mdi-link-variant</v-icon>
          <span>{{ $t('common_portfolio_link') }}</span>
        </a>
      </div>

      <ProfileChipGroup
        v-if="hasLanguages"
        :label="$t('common_languages')"
        :items="languageNames"
      />

      <ProfileChipGroup
        v-if="hasTools || hasEquipment || canEdit"
        :label="$t('gear_title')"
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
    </div>

    <div
      v-if="user?.avatar"
      class="avatar"
    >
      <img
        :src="getUserAvatar()"
        alt=""
      >
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { Practicalities } from '~~/shared/types/user';
import type { UserProfile } from '~/stores/user';
import { getLanguageDisplayName } from '~/utils/languages';
import Button from '~/components/Button.vue';
import ProfileChipGroup from '~/components/profile/ProfileChipGroup.vue';
import ProfileSectionNav from '~/components/profile/ProfileSectionNav.vue';

/**
 * The profile's identity card: name, professions, experience level, avatar, bio,
 * meta lines (location / education / portfolio) and the gear/languages chip
 * groups. Pure display derived from `user`; the owner's edit affordances emit
 * up so the parent keeps owning the popups.
 */
const props = defineProps<{
  user: UserProfile | null;
  canEdit: boolean;
  /** Visible profile sections to render as scroll-to tabs (built by the parent). */
  navSections: { id: string; label: string }[];
}>();

const emit = defineEmits<{
  editInfo: [];
  editGear: [];
}>();

const { t, locale } = useI18n();

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
  // Flex items default to min-width:auto (won't shrink below content), which
  // lets wide text push the fixed-width avatar off-screen. min-width:0 lets this
  // column shrink so its text wraps within the available space instead.
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
  // Wrap (and break long unbreakable words) rather than force the row wider.
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

.avatar {
  flex-shrink: 0;
  width: 320px;
  height: 400px;
  margin-bottom: 10px;
  border: 1px solid color(--v-theme-accent, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
</style>
