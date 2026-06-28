<template>
  <PopupShell
    v-model="open"
    :title="viewTitle"
    :show-back="view !== 'list'"
    @back="view = 'list'"
  >
    <!-- ───────────────── List view ───────────────── -->
    <template v-if="view === 'list'">
      <FieldCard
        icon="custom:camera-add"
        title="onboarding_education_title"
        description="onboarding_education_description"
      >
        <Input
          v-model="education"
          color="accent"
          type="text"
          :placeholder="$t('register_education_placeholder')"
          hide-details="auto"
        />
      </FieldCard>

      <FieldCard
        icon="custom:camera-add"
        title="onboarding_portfolio_title"
        description="onboarding_portfolio_description"
        :error="portfolioError"
      >
        <Input
          v-model="portfolio"
          color="accent"
          type="url"
          :placeholder="$t('register_portfolio_link_placeholder')"
          hide-details="auto"
          @update:model-value="portfolioError = ''"
        />
      </FieldCard>

      <FieldCard
        icon="custom:camera-add"
        title="onboarding_projects_title"
        description="onboarding_projects_description"
      >
        <ProfileListSection
          :items="projects"
          :add-label="$t('onboarding_add_project')"
          @add="startAddProject"
          @edit="startEditProject"
          @remove="removeProject"
        >
          <template #item="{ item }">
            {{ projectSummary(item) }}
          </template>
        </ProfileListSection>
      </FieldCard>

      <FieldCard
        icon="custom:camera-add"
        title="onboarding_work_experience_title"
        description="onboarding_work_experience_description"
      >
        <ProfileListSection
          :items="experience"
          :add-label="$t('onboarding_add_experience')"
          @add="startAddExperience"
          @edit="startEditExperience"
          @remove="removeExperience"
        >
          <template #item="{ item }">
            {{ experienceSummary(item) }}
          </template>
        </ProfileListSection>
      </FieldCard>
    </template>

    <!-- ───────────────── Project form ───────────────── -->
    <ProjectForm
      v-else-if="view === 'project-form'"
      ref="projectFormRef"
      :key="`project-${editingProjectIndex ?? 'new'}`"
      :initial="editingProject"
    />

    <!-- ───────────────── Experience form ───────────────── -->
    <ExperienceForm
      v-else
      ref="experienceFormRef"
      :key="`experience-${editingExperienceIndex ?? 'new'}`"
      :initial="editingExperience"
    />

    <!-- ───────────────── Actions ───────────────── -->
    <template #actions>
      <template v-if="view === 'list'">
        <Button
          variant="secondary"
          color="accent"
          size="large"
          :disabled="saving"
          @click="open = false"
        >
          {{ $t('common_skip_for_now') }}
        </Button>
        <Button
          color="accent"
          size="large"
          :loading="saving"
          @click="save"
        >
          {{ $t('common_save') }}
        </Button>
      </template>
      <template v-else>
        <Button
          variant="secondary"
          color="accent"
          size="large"
          @click="view = 'list'"
        >
          {{ $t('common_cancel') }}
        </Button>
        <Button
          color="accent"
          size="large"
          @click="view === 'project-form' ? commitProject() : commitExperience()"
        >
          {{ $t('common_done') }}
        </Button>
      </template>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import { STEP_IDS } from '~/components/auth/registerSteps';
import type { Project, Experience } from '~~/shared/types/user';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import FieldCard from '~/components/profile/popups/FieldCard.vue';
import ProfileListSection from '~/components/profile/popups/ProfileListSection.vue';
import ProjectForm from '~/components/profile/popups/ProjectForm.vue';
import ExperienceForm from '~/components/profile/popups/ExperienceForm.vue';
import Button from '~/components/Button.vue';

type View = 'list' | 'project-form' | 'experience-form';
type FormExposed<T> = { commit: () => T | null };

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  completed: [];
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();

const view = ref<View>('list');
const saving = ref(false);

const education = ref(authStore.user?.education ?? '');
const portfolio = ref(authStore.user?.portfolio ?? '');
const portfolioError = ref('');
// Deep-copy so in-popup edits don't mutate the store until the user saves.
const projects = ref<Project[]>(JSON.parse(JSON.stringify(authStore.user?.projects ?? [])));
const experience = ref<Experience[]>(JSON.parse(JSON.stringify(authStore.user?.experience ?? [])));

const viewTitle = computed(() => {
  if (view.value === 'project-form') return t('onboarding_project_title');
  if (view.value === 'experience-form') return t('onboarding_experience_title');
  return t('onboarding_details_title');
});

// ── List-row summaries ──
const projectSummary = (p: Project) => [p.name, t(p.type), p.year].filter(Boolean).join(' · ');
const experienceSummary = (e: Experience) => `${e.position} · ${e.company}`;

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/i;

// ── Project form ──
const projectFormRef = ref<FormExposed<Project> | null>(null);
const editingProjectIndex = ref<number | null>(null);
const editingProject = computed(() =>
  editingProjectIndex.value !== null ? projects.value[editingProjectIndex.value] : undefined,
);

const startAddProject = () => {
  editingProjectIndex.value = null;
  view.value = 'project-form';
};
const startEditProject = (index: number) => {
  editingProjectIndex.value = index;
  view.value = 'project-form';
};
const removeProject = (index: number) => {
  projects.value = projects.value.filter((_, i) => i !== index);
};
const commitProject = () => {
  const project = projectFormRef.value?.commit();
  if (!project) return;
  if (editingProjectIndex.value === null) {
    projects.value = [...projects.value, project];
  }
  else {
    projects.value = projects.value.map((p, i) => (i === editingProjectIndex.value ? project : p));
  }
  view.value = 'list';
};

// ── Experience form ──
const experienceFormRef = ref<FormExposed<Experience> | null>(null);
const editingExperienceIndex = ref<number | null>(null);
const editingExperience = computed(() =>
  editingExperienceIndex.value !== null ? experience.value[editingExperienceIndex.value] : undefined,
);

const startAddExperience = () => {
  editingExperienceIndex.value = null;
  view.value = 'experience-form';
};
const startEditExperience = (index: number) => {
  editingExperienceIndex.value = index;
  view.value = 'experience-form';
};
const removeExperience = (index: number) => {
  experience.value = experience.value.filter((_, i) => i !== index);
};
const commitExperience = () => {
  const exp = experienceFormRef.value?.commit();
  if (!exp) return;
  if (editingExperienceIndex.value === null) {
    experience.value = [...experience.value, exp];
  }
  else {
    experience.value = experience.value.map((e, i) => (i === editingExperienceIndex.value ? exp : e));
  }
  view.value = 'list';
};

// ── Persist everything ──
const save = async () => {
  portfolioError.value = '';
  const link = portfolio.value.trim();
  if (link && !URL_RE.test(link.startsWith('http') ? link : `https://${link}`)) {
    portfolioError.value = t('register_portfolio_invalid_url');
    return;
  }
  const normalizedLink = link && !/^https?:\/\//i.test(link) ? `https://${link}` : link;

  saving.value = true;
  try {
    const data = await userStore.updateUser({
      education: education.value.trim(),
      portfolio: normalizedLink,
      projects: projects.value,
      experience: experience.value,
      completeStep: STEP_IDS.BACKGROUND_DETAILS,
    });
    if (!data) return;

    open.value = false;
    emit('completed');
  }
  finally {
    saving.value = false;
  }
};
</script>
