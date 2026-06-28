<template>
  <PopupShell
    v-model="open"
    :title="view === 'list' ? $t('common_projects') : $t('onboarding_project_title')"
    :show-back="view === 'form' && mode === 'list'"
    @back="view = 'list'"
  >
    <template v-if="view === 'list'">
      <ProfileListSection
        :items="projects"
        :add-label="$t('onboarding_add_project')"
        @add="startAdd"
        @edit="startEdit"
        @remove="remove"
      >
        <template #item="{ item }">
          {{ projectSummary(item) }}
        </template>
      </ProfileListSection>
    </template>

    <ProjectForm
      v-else
      ref="formRef"
      :key="`project-${editingIndex ?? 'new'}`"
      :initial="editingProject"
    />

    <template #actions>
      <template v-if="view === 'list'">
        <Button
          variant="secondary"
          color="accent"
          size="large"
          :disabled="saving"
          @click="open = false"
        >
          {{ $t('common_cancel') }}
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
          :disabled="saving"
          @click="cancelForm"
        >
          {{ $t('common_cancel') }}
        </Button>
        <Button
          color="accent"
          size="large"
          :loading="saving"
          @click="doneForm"
        >
          {{ $t('common_done') }}
        </Button>
      </template>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import type { Project } from '~~/shared/types/user';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import ProfileListSection from '~/components/profile/popups/ProfileListSection.vue';
import ProjectForm from '~/components/profile/popups/ProjectForm.vue';
import Button from '~/components/Button.vue';

/**
 * Profile-side manager for the user's projects: list with add/edit/remove, a
 * project form (reused from onboarding), and a single save through
 * `updateUser({ projects })`. `mode="add"` jumps straight to a blank form.
 */
const open = defineModel<boolean>({ required: true });

const props = withDefaults(
  defineProps<{ mode?: 'list' | 'add' }>(),
  { mode: 'list' },
);

const emit = defineEmits<{ saved: [] }>();

const { t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();

type FormExposed = { commit: () => Project | null };

const projects = ref<Project[]>(JSON.parse(JSON.stringify(authStore.user?.projects ?? [])));
const saving = ref(false);
const view = ref<'list' | 'form'>(props.mode === 'add' ? 'form' : 'list');

const formRef = ref<FormExposed | null>(null);
const editingIndex = ref<number | null>(null);
const editingProject = computed(() =>
  editingIndex.value !== null ? projects.value[editingIndex.value] : undefined,
);

const projectSummary = (p: Project) => [p.name, t(p.type), p.year].filter(Boolean).join(' · ');

const startAdd = () => {
  editingIndex.value = null;
  view.value = 'form';
};
const startEdit = (index: number) => {
  editingIndex.value = index;
  view.value = 'form';
};
const remove = (index: number) => {
  projects.value = projects.value.filter((_, i) => i !== index);
};
const applyDraft = (): boolean => {
  const project = formRef.value?.commit();
  if (!project) return false;
  if (editingIndex.value === null) {
    projects.value = [...projects.value, project];
  }
  else {
    projects.value = projects.value.map((p, i) => (i === editingIndex.value ? project : p));
  }
  return true;
};

// In list-mode the form is reached from the list, so committing returns there
// (the list's Save persists). In add-mode the form IS the popup — commit then
// save+close, and Cancel/close just dismisses (no back-to-a-list-never-seen).
const doneForm = async () => {
  if (!applyDraft()) return;
  if (props.mode === 'add') await save();
  else view.value = 'list';
};
const cancelForm = () => {
  if (props.mode === 'add') open.value = false;
  else view.value = 'list';
};

const save = async () => {
  saving.value = true;
  try {
    const data = await userStore.updateUser({ projects: projects.value });
    if (!data) return;
    open.value = false;
    emit('saved');
  }
  finally {
    saving.value = false;
  }
};
</script>
