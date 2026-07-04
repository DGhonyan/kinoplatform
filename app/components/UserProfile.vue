<template>
  <div class="user-profile">
    <ProfileCompletionBanner
      v-if="showBanner"
      :remaining="remainingOptional"
      @open="openCompletionFlow"
      @dismiss="dismissBanner"
    />

    <!-- ───────────── 1. Personal info ───────────── -->
    <!-- `id` falls through to the component's root <section> as the "about" anchor. -->
    <ProfilePersonalInfo
      id="profile-about"
      :user="user"
      :can-edit="canEdit"
      :nav-sections="navSections"
      @edit-info="showEditInfo = true"
      @edit-gear="openGear"
    />

    <!-- ───────────── 2. Projects ───────────── -->
    <section
      v-if="hasProjects || canEdit"
      id="profile-projects"
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
        <ProjectCard
          v-for="(p, i) in visibleProjects"
          :key="i"
          :project="p"
        />
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
      id="profile-experience"
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
        <ExperienceItem
          v-for="(e, i) in user?.experience"
          :key="i"
          :experience="e"
        />
      </ol>
    </section>

    <!-- ───────────── Recommendations ───────────── -->
    <section
      v-if="showRecommendations"
      id="profile-recommendations"
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
      @completed="afterDetails"
      @skip="afterDetails"
    />
    <GearAndTravelPopup
      v-if="canEdit && showGearPopup"
      v-model="showGearPopup"
      @completed="afterGear"
    />
  </div>
</template>

<script lang="ts" setup>
import type { UserProfile } from '~/stores/user';
import { isOnboardingComplete } from '~/utils/onboarding';
import Button from '~/components/Button.vue';
import ProjectCard from '~/components/profile/ProjectCard.vue';
import ExperienceItem from '~/components/profile/ExperienceItem.vue';
import ProfilePersonalInfo from '~/components/profile/ProfilePersonalInfo.vue';
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

// ── Presence flags (gear ones also gate the completion-flow nudge below) ──
const hasProjects = computed(() => (user.value?.projects?.length ?? 0) > 0);
const hasExperience = computed(() => (user.value?.experience?.length ?? 0) > 0);
const hasTools = computed(() => (user.value?.tools?.length ?? 0) > 0);
const hasEquipment = computed(() => (user.value?.equipment?.length ?? 0) > 0);

// Scroll-to tabs rendered in the personal-info card. Only sections that actually
// exist appear — each id matches a section's DOM id below. Recommendations tracks
// its own section's visibility (which can be false for an owner with no recs).
const navSections = computed(() =>
  [
    { id: 'profile-about', label: 'profile_nav_about', show: !!user.value?.bio },
    { id: 'profile-projects', label: 'common_projects', show: hasProjects.value },
    { id: 'profile-experience', label: 'profile_experience', show: hasExperience.value },
    { id: 'profile-recommendations', label: 'recommendation_title', show: showRecommendations.value },
  ]
    .filter(s => s.show)
    .map(({ id, label }) => ({ id, label })),
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

// Gear can always be opened standalone (the section shows an entry point for the
// owner even when empty) — no dependency on the banner flow.
const openGear = () => {
  showGearPopup.value = true;
};

// The banner walks the incomplete sections in order: it opens the first one, and
// finishing OR skipping the details step advances to gear (details is flow-only,
// so both its Save and Skip route through here). Gear is the last step — its Save
// just refreshes, and Skip/close simply ends the flow.
const openCompletionFlow = () => {
  if (!detailsComplete.value) showDetailsPopup.value = true;
  else if (!gearComplete.value) showGearPopup.value = true;
};
const afterDetails = () => {
  syncProfileFromAuth();
  if (!gearComplete.value) showGearPopup.value = true;
};
const afterGear = () => {
  syncProfileFromAuth();
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
  padding: 14px;
}

/* ── Section heads (projects / experience) ── */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid color(--v-theme-accent);
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
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* ── Experience timeline ── */
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style>
