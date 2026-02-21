<template>
  <div class="add-personal-info">
    <template v-for="field in Object.values(fields)" :key="field.label">
      <component
        :is="field.component"
        :label="field.label"
        v-model="field.model.value"
        :required="field.required"
        :error-messages="field.errorMessages?.value"
        hide-details="auto"
        @update:model-value="field.errorMessages && (field.errorMessages.value = '')"
      />
    </template>
    
    <Select
      :label="'Professions'"
      v-model="currentProfessions"
      required
      :items="professions"
      multiple
      :error-messages="professionsErrorMessages"
      @update:model-value="professionsErrorMessages = ''"
    />

    <AddProject :projects="projects" @update:projects="updateProjects" />

    <v-btn color="primary" @click="addPersonalInfo">Update Personal Info</v-btn>
  </div>
</template>

<script lang="ts" setup>
import Input from '@/components/Input.vue';
import Select from '@/components/Select.vue';
import TextArea from '@/components/TextArea.vue';
import AddProject from './AddProject.vue';
import { ref, type Ref, type Component } from 'vue';
import type { PersonalInfoProject } from '@/types/user';
import { validateFields } from '@/common/utils';
import { useUserStore } from '@/stores/user';
import { useRouteHelpers } from '@/composables/useRouteHelpers';

const { navigateTo } = useRouteHelpers();

const userStore = useUserStore();

const professions = ref([
  'Camera Operator',
  'Sound Operator',
  'Lighting Operator',
  'Other',
]);

const currentProfessions = ref<string[]>([]);
const projects = ref<PersonalInfoProject[]>([]);
const professionsErrorMessages = ref('');

const fields: Record<string, {
    model: Ref<string | undefined>,
    label: string,
    required: boolean,
    component: Component,
    errorMessages?: Ref<string>
  }> = {
  firstName: {
    model: ref(''),
    label: 'First Name',
    required: true,
    component: Input,
    errorMessages: ref(''),
  },
  lastName: {
    model: ref(''),
    label: 'Last Name',
    required: true,
    component: Input,
    errorMessages: ref(''),
  },
  bio: {
    model: ref(''),
    label: 'Bio',
    component: TextArea,
    required: false,
  },
  portfolio: {
    model: ref(undefined),
    label: 'Portfolio link',
    component: Input,
    required: false,
  },
};

const updateProjects = (newProjects: PersonalInfoProject[]) => {
  projects.value = newProjects;
};

const addPersonalInfo = async () => {
  professionsErrorMessages.value = '';

  if (currentProfessions.value.length === 0) {
    professionsErrorMessages.value = 'This field is required';
  }

  if (validateFields(fields) || professionsErrorMessages.value) return;

  try {
    await userStore.updateUser({
      first_name: fields.firstName?.model.value,
      last_name: fields.lastName?.model.value,
      bio: fields.bio?.model.value,
      portfolio: fields.portfolio?.model.value,
      projects: projects.value,
      profession: currentProfessions.value,
    });

    navigateTo('Home');
  } catch (error) {
    console.error('Failed to update user');
  }
};
</script>

<style scoped lang="scss">
.add-personal-info {
  width: 70%;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  gap: 16px;
}
</style>