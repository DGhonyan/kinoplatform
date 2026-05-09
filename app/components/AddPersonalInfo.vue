<template>
  <div class="add-personal-info">
    <FileUpload
      v-model="avatarBlobName"
      label="common_profile_photo"
      accept="image/*"
      placeholder="personal_info_upload_photo"
      helper-text="personal_info_upload_photo_helper_text"
      @upload:error="handleUploadError"
    />

    <template
      v-for="field in Object.values(fields)"
      :key="field.label"
    >
      <component
        :is="field.component"
        v-model="field.model.value"
        :label="field.label"
        :required="field.required"
        :error-messages="field.errorMessages?.value"
        hide-details="auto"
        @update:model-value="field.errorMessages && (field.errorMessages.value = '')"
      />
    </template>

    <Select
      v-model="currentProfessions"
      label="common_professions"
      required
      :items="professions.map(profession => ({ title: $t(profession), value: profession }))"
      multiple
      :error-messages="professionsErrorMessages"
      @update:model-value="professionsErrorMessages = ''"
    />

    <AddProject
      :projects="projects"
      @update:projects="updateProjects"
    />

    <v-btn
      color="primary"
      @click="addPersonalInfo"
    >
      {{ $t('personal_info_update_personal_info') }}
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import type { PersonalInfoProject } from '~~/shared/types/user';
import Input from './Input.vue';
import TextArea from './TextArea.vue';

const { t } = useI18n();
const userStore = useUserStore();

const avatarBlobName = ref('');
const currentProfessions = ref<string[]>([]);
const projects = ref<PersonalInfoProject[]>([]);
const professionsErrorMessages = ref('');

const fields: Record<string, {
  model: Ref<string | undefined>;
  label: string;
  required: boolean;
  component: Component;
  errorMessages?: Ref<string>;
}> = {
  firstName: {
    model: ref(''),
    label: 'common_first_name',
    required: true,
    component: Input,
    errorMessages: ref(''),
  },
  lastName: {
    model: ref(''),
    label: 'common_last_name',
    required: true,
    component: Input,
    errorMessages: ref(''),
  },
  bio: {
    model: ref(''),
    label: 'common_bio',
    component: TextArea,
    required: false,
  },
  portfolio: {
    model: ref(undefined),
    label: 'common_portfolio_link',
    component: Input,
    required: false,
  },
};

const updateProjects = (newProjects: PersonalInfoProject[]) => {
  projects.value = newProjects;
};

const handleUploadError = (error: Error) => {
  console.error('File upload error:', error);
};

const addPersonalInfo = async () => {
  professionsErrorMessages.value = '';

  if (currentProfessions.value.length === 0) {
    professionsErrorMessages.value = t('common_this_field_is_required');
  }

  if (validateFields(fields, t) || professionsErrorMessages.value) return;

  try {
    await userStore.updateUser({
      firstName: fields.firstName?.model.value,
      lastName: fields.lastName?.model.value,
      bio: fields.bio?.model.value,
      portfolio: fields.portfolio?.model.value,
      projects: projects.value,
      profession: currentProfessions.value,
      avatar: avatarBlobName.value || undefined,
    });

    navigateTo('/');
  }
  catch {
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
