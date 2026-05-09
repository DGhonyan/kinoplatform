<template>
  <div class="add-project">
    <div class="add-project-header">
      <div class="label">
        {{ $t('personal_info_projects_optional') }}
      </div>
      <div
        v-if="error"
        class="error-message"
      >
        <span>{{ $t(error) }}</span>
      </div>
    </div>

    <div
      v-if="projects.length > 0"
      class="project-list"
    >
      <div
        v-for="(project, index) in projects"
        :key="`${project.name}-${index}`"
        class="project-item"
      >
        <span>{{ project.name }} - {{ project.year }} - {{ project.link }}</span>
        <v-btn
          color="error"
          icon="mdi-delete"
          size="x-small"
          @click="removeProject(index)"
        />
      </div>
    </div>

    <div class="project-items">
      <div class="inputs">
        <Input
          v-model="currentProject.name"
          :label="'personal_info_project_name'"
          required
        />
        <Input
          v-model="currentProject.year"
          :label="'personal_info_project_year'"
          required
          type="number"
        />
        <Input
          v-model="currentProject.link"
          :label="'personal_info_project_link'"
          required
        />
      </div>
      <v-btn
        class="add-project-button"
        variant="outlined"
        color="primary"
        @click="addProject"
      >
        {{ $t('personal_info_add_project') }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PersonalInfoProject } from '~~/shared/types/user';

const props = defineProps<{
  projects: PersonalInfoProject[];
}>();

const emit = defineEmits<{
  (e: 'update:projects', projects: PersonalInfoProject[]): void;
}>();

const currentProject = ref<PersonalInfoProject>({ name: '', year: 2000, link: '' });
const error = ref<string | null>(null);

const validateFields = (fields: PersonalInfoProject) => {
  error.value = null;

  for (const field in fields) {
    if (!fields[field as keyof PersonalInfoProject]) {
      error.value = 'common_all_fields_are_required';
      return true;
    }
  }

  return false;
};

const addProject = () => {
  if (validateFields(currentProject.value)) return;

  emit('update:projects', [...props.projects, currentProject.value]);
  currentProject.value = { name: '', year: 2000, link: '' };
};

const removeProject = (index: number) => {
  emit('update:projects', props.projects.filter((_, i) => i !== index));
};
</script>

<style scoped lang="scss">
.add-project {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .add-project-header {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .label {
      font-size: 16px;
      font-weight: 500;
      color: color(--v-theme-gray);
    }

    .error-message {
      color: color(--v-theme-error);
      font-size: 12px;
    }
  }

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .project-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  .project-items {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 16px;

    .inputs {
      display: flex;
      gap: 16px;

      .shared-input {
        width: 100%;
      }
    }
  }

  .add-project-button {
    width: fit-content;
  }
}
</style>
