<template>
  <div class="add-project">
    <div class="add-project-header">
      <div class="label">Projects (optional)</div>
      <div class="error-message" v-if="error">
        <span>{{ error }}</span>
      </div>
    </div>

    <div class="project-list" v-if="projects.length > 0"> 
      <div class="project-item" v-for="(project, index) in projects">
        <span>{{ project.name }} - {{ project.year }} - {{ project.link }}</span>
        <v-btn color="error" icon="mdi-delete" @click="removeProject(index)" size="x-small">
        </v-btn>
      </div>
    </div>

    <div class="project-items">
      <div class="inputs">
        <Input
          :label="'Project Name'"
          v-model="currentProject.name"
          required
        />
        <Input
          :label="'Project Year'"
          v-model="currentProject.year"
          required
          type="number"
        />
        <Input
          :label="'Project Link'"
          v-model="currentProject.link"
          required
        />
      </div>
      <v-btn class="add-project-button" variant="outlined" color="primary" @click="addProject">Add Project</v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Input from '@/components/Input.vue';
import type { PersonalInfoProject } from '@/types/user';

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
      error.value = 'All fields are required';
      return true
    }
  }

  return false;
}

const addProject = () => {
  if (validateFields(currentProject.value)) return;

  props.projects.push(currentProject.value);
  emit('update:projects', props.projects);
  currentProject.value = { name: '', year: 2000, link: '' };
};

const removeProject = (index: number) => {
  props.projects.splice(index, 1);
  emit('update:projects', props.projects);
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