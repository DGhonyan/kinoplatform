<template>
  <div class="user-profile">
    <ProfileCompletionBanner
      v-if="showBanner"
      :remaining="remainingOptional"
      @open="openCompletionFlow"
      @dismiss="dismissBanner"
    />

    <!-- ───────────── 1. Personal info ───────────── -->
    <section class="container">
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
              @click="showEditInfo = true"
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

        <div
          v-if="user?.avatar"
          class="avatar"
        >
          <img
            :src="getUserAvatar()"
            alt=""
          >
        </div>
      </div>

      <p
        v-if="user?.bio"
        class="bio"
      >
        {{ user.bio }}
      </p>

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

      <div
        v-if="hasLanguages"
        class="chip-group"
      >
        <span class="chip-label">{{ $t('common_languages') }}</span>
        <div class="chips">
          <v-chip
            v-for="code in user?.languages"
            :key="code"
            size="small"
            color="accent"
          >
            {{ languageName(code) }}
          </v-chip>
        </div>
      </div>

      <div
        v-if="hasTools || hasEquipment"
        class="chip-group"
      >
        <div class="chip-label-row">
          <span class="chip-label">{{ $t('gear_title') }}</span>
          <Button
            v-if="canEdit"
            icon="mdi-pencil"
            variant="text"
            size="x-small"
            :aria-label="$t('common_edit')"
            @click="openGear"
          />
        </div>
        <div class="chips">
          <v-chip
            v-for="item in [...(user?.tools ?? []), ...(user?.equipment ?? [])]"
            :key="item"
            size="small"
            color="accent"
          >
            {{ item }}
          </v-chip>
        </div>
      </div>

      <div
        v-if="enabledPracticalities.length"
        class="chip-group"
      >
        <div class="chip-label-row">
          <span class="chip-label">{{ $t('gear_practicalities_label') }}</span>
          <Button
            v-if="canEdit"
            icon="mdi-pencil"
            variant="text"
            size="x-small"
            :aria-label="$t('common_edit')"
            @click="openGear"
          />
        </div>
        <div class="chips">
          <v-chip
            v-for="key in enabledPracticalities"
            :key="key"
            size="small"
            color="accent"
          >
            {{ $t(`practicality_${key}`) }}
          </v-chip>
        </div>
      </div>
    </section>

    <!-- ───────────── 2. Projects ───────────── -->
    <section
      v-if="hasProjects || canEdit"
      class="container"
    >
      <div class="section-head">
        <h2 class="section-title">
          {{ $t('common_projects') }}
        </h2>
        <div
          v-if="canEdit"
          class="section-actions"
        >
          <Button
            variant="text"
            size="small"
            prepend-icon="mdi-plus"
            color="accent"
            @click="openProjects('add')"
          >
            {{ $t('common_add') }}
          </Button>
          <Button
            v-if="hasProjects"
            variant="text"
            size="small"
            prepend-icon="mdi-pencil"
            color="accent"
            @click="openProjects('list')"
          >
            {{ $t('common_edit') }}
          </Button>
        </div>
      </div>

      <p
        v-if="!hasProjects"
        class="empty-state"
      >
        {{ $t('profile_no_projects_yet') }}
      </p>

      <div
        v-else
        class="projects"
      >
        <div
          v-for="(p, i) in visibleProjects"
          :key="i"
          class="project-item"
        >
          <component
            :is="p.link ? 'a' : 'div'"
            :href="p.link || undefined"
            :target="p.link ? '_blank' : undefined"
            class="project-name"
          >
            {{ p.name }}
          </component>
          <span class="project-meta">{{ projectLine(p) }}</span>
          <p
            v-if="p.description"
            class="project-desc"
          >
            {{ p.description }}
          </p>
        </div>
      </div>

      <Button
        v-if="(user?.projects?.length ?? 0) > PROJECTS_PREVIEW"
        variant="text"
        color="accent"
        @click="projectsExpanded = !projectsExpanded"
      >
        {{ projectsExpanded ? $t('profile_show_less') : $t('profile_show_all', { count: user?.projects?.length }) }}
      </Button>
    </section>

    <!-- ───────────── 3. Experience ───────────── -->
    <section
      v-if="hasExperience || canEdit"
      class="container"
    >
      <div class="section-head">
        <h2 class="section-title">
          {{ $t('profile_experience') }}
        </h2>
        <div
          v-if="canEdit"
          class="section-actions"
        >
          <Button
            variant="text"
            size="small"
            prepend-icon="mdi-plus"
            color="accent"
            @click="openExperience('add')"
          >
            {{ $t('common_add') }}
          </Button>
          <Button
            v-if="hasExperience"
            variant="text"
            size="small"
            prepend-icon="mdi-pencil"
            color="accent"
            @click="openExperience('list')"
          >
            {{ $t('common_edit') }}
          </Button>
        </div>
      </div>

      <p
        v-if="!hasExperience"
        class="empty-state"
      >
        {{ $t('profile_no_experience_yet') }}
      </p>

      <ol
        v-else
        class="timeline"
      >
        <li
          v-for="(e, i) in user?.experience"
          :key="i"
          class="timeline-item"
        >
          <span class="timeline-marker" />
          <div class="timeline-body">
            <span class="exp-title">{{ e.position }} · {{ e.company }}</span>
            <span class="exp-date">{{ experienceLine(e) }}</span>
            <p
              v-if="e.description"
              class="exp-desc"
            >
              {{ e.description }}
            </p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ───────────── Recommendations ───────────── -->
    <section
      v-if="showRecommendations"
      class="container"
    >
      <h2 class="section-title">
        {{ $t('recommendation_title') }}
      </h2>
      <ProfileRecommendations
        :target-id="user?._id ?? ''"
        :recommendations="user?.recommendations ?? []"
        :is-owner="canEdit"
        @changed="loadUserData"
      />
    </section>

    <!-- Availability — hidden for now; flip showAvailability to bring it back. -->
    <ProfileAvailability
      v-if="showAvailability"
      :user-id="userId"
      :can-edit="canEdit"
    />

    <!-- ───────────── Edit popups ───────────── -->
    <EditPersonalInfoPopup
      v-if="canEdit && showEditInfo"
      v-model="showEditInfo"
      @saved="onSaved"
    />
    <ProjectsManagerPopup
      v-if="canEdit && showProjectsManager"
      v-model="showProjectsManager"
      :mode="projectsMode"
      @saved="onSaved"
    />
    <ExperienceManagerPopup
      v-if="canEdit && showExperienceManager"
      v-model="showExperienceManager"
      :mode="experienceMode"
      @saved="onSaved"
    />
    <ProjectsExperiencePopup
      v-if="canEdit && showDetailsPopup"
      v-model="showDetailsPopup"
      @completed="onPopupCompleted"
    />
    <GearAndTravelPopup
      v-if="canEdit && showGearPopup"
      v-model="showGearPopup"
      @completed="onPopupCompleted"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Project, Experience, Practicalities } from '~~/shared/types/user';
import type { UserProfile } from '~/stores/user';
import { getLanguageDisplayName } from '~/utils/languages';
import { isOnboardingComplete } from '~/utils/onboarding';
import Button from '~/components/Button.vue';
import ProfileCompletionBanner from '~/components/profile/ProfileCompletionBanner.vue';
import ProfileRecommendations from '~/components/profile/ProfileRecommendations.vue';
import ProfileAvailability from '~/components/profile/ProfileAvailability.vue';
import ProjectsExperiencePopup from '~/components/profile/popups/ProjectsExperiencePopup.vue';
import GearAndTravelPopup from '~/components/profile/popups/GearAndTravelPopup.vue';
import EditPersonalInfoPopup from '~/components/profile/popups/EditPersonalInfoPopup.vue';
import ProjectsManagerPopup from '~/components/profile/popups/ProjectsManagerPopup.vue';
import ExperienceManagerPopup from '~/components/profile/popups/ExperienceManagerPopup.vue';

const PROJECTS_PREVIEW = 3;
// Availability is hidden for now (kept as a component) — flip to show it again.
const showAvailability = false;

const { t, locale } = useI18n();

const props = defineProps<{
  userId: string | undefined;
}>();

const authStore = useAuthStore();
const userStore = useUserStore();

const user = ref<UserProfile | null>(null);

const canEdit = computed(() => user.value?._id === authStore.user?._id);

const hasRecommendations = computed(() => (user.value?.recommendations?.length ?? 0) > 0);
const canLeaveRecommendation = computed(() =>
  !!user.value && !canEdit.value && isOnboardingComplete(authStore.user),
);
const showRecommendations = computed(() => hasRecommendations.value || canLeaveRecommendation.value);

// ── Display helpers ──
const professionsText = computed(() =>
  (user.value?.profession ?? []).map(p => t(p)).join(', '),
);
const languageName = (code: string) => getLanguageDisplayName(code, locale.value) ?? code;
const monthName = (m: number) =>
  new Date(2000, Math.max(0, m - 1), 1).toLocaleDateString(locale.value, { month: 'short' });

const projectLine = (p: Project) =>
  [p.type ? t(p.type) : '', p.position ? t(p.position) : '', p.year].filter(Boolean).join(' · ');

const experienceLine = (e: Experience) => {
  const start = `${monthName(e.startMonth)} ${e.startYear}`;
  const end = e.currentlyWorking
    ? t('onboarding_present')
    : e.endYear
      ? (e.endMonth ? `${monthName(e.endMonth)} ${e.endYear}` : String(e.endYear))
      : '';
  const range = end ? `${start} – ${end}` : start;
  return [t(e.employmentType), range].filter(Boolean).join(' · ');
};

const getUserAvatar = () =>
  user.value?.avatar || new URL('@/assets/default.jpg', import.meta.url).href;

// ── Presence flags ──
const hasLanguages = computed(() => (user.value?.languages?.length ?? 0) > 0);
const hasProjects = computed(() => (user.value?.projects?.length ?? 0) > 0);
const hasExperience = computed(() => (user.value?.experience?.length ?? 0) > 0);
const hasTools = computed(() => (user.value?.tools?.length ?? 0) > 0);
const hasEquipment = computed(() => (user.value?.equipment?.length ?? 0) > 0);

const PRACTICALITY_KEYS: (keyof Practicalities)[] = [
  'willingToTravel',
  'availableForLongShoots',
  'passportAvailable',
  'visaAvailable',
  'drivingLicenseAvailable',
];
const enabledPracticalities = computed(() =>
  PRACTICALITY_KEYS.filter(k => user.value?.practicalities?.[k]),
);

// ── Projects inline expand ──
const projectsExpanded = ref(false);
const visibleProjects = computed(() =>
  projectsExpanded.value
    ? (user.value?.projects ?? [])
    : (user.value?.projects ?? []).slice(0, PROJECTS_PREVIEW),
);

// ── Edit popups ──
const showEditInfo = ref(false);
const showProjectsManager = ref(false);
const projectsMode = ref<'list' | 'add'>('list');
const showExperienceManager = ref(false);
const experienceMode = ref<'list' | 'add'>('list');

const openProjects = (mode: 'list' | 'add') => {
  projectsMode.value = mode;
  showProjectsManager.value = true;
};
const openExperience = (mode: 'list' | 'add') => {
  experienceMode.value = mode;
  showExperienceManager.value = true;
};

// authStore.user is a plain User (no events/recommendations); keep the ones we
// already loaded when folding the edited fields back into the profile view.
const syncProfileFromAuth = () => {
  if (!authStore.user) return;
  user.value = {
    ...authStore.user,
    events: user.value?.events ?? [],
    recommendations: user.value?.recommendations ?? [],
  };
};

const onSaved = () => {
  // updateUser/attachAvatar already refreshed authStore.user.
  syncProfileFromAuth();
};

// ── Profile-completion nudge (own profile, optional sections) ──
const showDetailsPopup = ref(false);
const showGearPopup = ref(false);
const bannerDismissed = ref(false);
const flowActive = ref(false);

const detailsComplete = computed(() =>
  !!user.value?.education || !!user.value?.portfolio || hasProjects.value || hasExperience.value,
);
const gearComplete = computed(() => hasTools.value || hasEquipment.value);
const remainingOptional = computed(() =>
  (detailsComplete.value ? 0 : 1) + (gearComplete.value ? 0 : 1),
);
const showBanner = computed(() =>
  canEdit.value && !bannerDismissed.value && remainingOptional.value > 0,
);

const openGear = () => {
  flowActive.value = false;
  showGearPopup.value = true;
};
const openNextIncomplete = () => {
  if (!detailsComplete.value) showDetailsPopup.value = true;
  else if (!gearComplete.value) showGearPopup.value = true;
  else flowActive.value = false;
};
const openCompletionFlow = () => {
  flowActive.value = true;
  openNextIncomplete();
};
const onPopupCompleted = () => {
  syncProfileFromAuth();
  if (flowActive.value) openNextIncomplete();
};
const dismissBanner = () => {
  bannerDismissed.value = true;
};

// ── Load ──
const loadUserData = async () => {
  const targetId = props.userId || authStore.user?._id;
  if (!targetId) return;

  const profile = await userStore.getUserProfile(targetId);
  if (!profile) return;

  // UserProfile is a superset of User (it carries `events`); fine to keep for
  // display, and availability lives in its own component now.
  user.value = profile;

  if (targetId === authStore.user?._id) authStore.setUser(profile);
};

onMounted(loadUserData);
watch(() => props.userId, loadUserData);
</script>

<style scoped lang="scss">
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
  border-radius: 20px;
  border: 1px solid color(--v-theme-on-surface, 0.1);
  background-color: color(--v-theme-on-surface, 0.03);
}

/* ── Personal info ── */
.personal-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
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
}

.professions {
  font-size: 15px;
  color: color(--v-theme-accent);
}

.experience-level {
  font-size: 13px;
  opacity: 0.7;
}

.avatar {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid color(--v-theme-accent, 0.4);

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
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: inherit;
  text-decoration: none;

  .v-icon {
    opacity: 0.7;
  }
}

.portfolio {
  color: color(--v-theme-accent);
  width: fit-content;

  &:hover {
    text-decoration: underline;
  }
}

.chip-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chip-label-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chip-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Section heads (projects / experience) ── */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 4px;
}

.empty-state {
  font-size: 14px;
  opacity: 0.6;
  margin: 0;
}

/* ── Projects ── */
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.project-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  // Grid cells default to min-width:auto, which lets long content force the
  // column wider (overflow). 0 lets the card shrink so its text can wrap.
  min-width: 0;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid color(--v-theme-on-surface, 0.12);
  background-color: color(--v-theme-on-surface, 0.03);
}

.project-name {
  font-size: 16px;
  font-weight: 500;
  color: inherit;
  text-decoration: none;
  // Break long unbreakable strings (URLs, single long words) instead of spilling.
  overflow-wrap: anywhere;
}

a.project-name {
  color: color(--v-theme-accent);

  &:hover {
    text-decoration: underline;
  }
}

.project-meta {
  font-size: 13px;
  opacity: 0.7;
  overflow-wrap: anywhere;
}

.project-desc {
  font-size: 14px;
  margin: 4px 0 0;
  opacity: 0.85;
  overflow-wrap: anywhere;
  // Keep cards tidy — clamp long descriptions to a few lines.
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Experience timeline ── */
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.timeline-item {
  position: relative;
  padding-left: 28px;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }

  // Connecting line between dots.
  &::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 14px;
    bottom: -2px;
    width: 2px;
    background-color: color(--v-theme-accent, 0.35);
  }

  &:last-child::before {
    display: none;
  }
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: color(--v-theme-accent);
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-title {
  font-size: 16px;
  font-weight: 500;
}

.exp-date {
  font-size: 13px;
  opacity: 0.7;
}

.exp-desc {
  font-size: 14px;
  margin: 4px 0 0;
  opacity: 0.85;
}
</style>
