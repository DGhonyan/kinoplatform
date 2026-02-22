<template>
  <div class="register-form">

    <template v-for="field in Object.values(fields)" :key="field.label">
      <Input
        :type="field.type"
        :label="field.label"
        v-model="field.model.value"
        density="compact"
        required
        :error-messages="field.errorMessages.value"
        hide-details="auto"
      />
    </template>

    <v-btn color="primary" @click="handleRegister">Register</v-btn>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Input from '@/components/Input.vue';
import { useApi } from '@/common/api';
import { validateFields } from '@/common/utils';
import { useRouteHelpers } from '@/composables/useRouteHelpers';
import { useAuthStore } from '@/stores/auth';

const { navigateTo } = useRouteHelpers();
const authStore = useAuthStore();

const fields = {
  email: {
    model: ref(''),
    label: 'Email',
    type: 'email',
    errorMessages: ref(''),
  },
  password: {
    model: ref(''),
    label: 'Password',
    type: 'password',
    errorMessages: ref(''),
  },
  confirmPassword: {
    model: ref(''),
    label: 'Confirm Password',
    type: 'password',
    errorMessages: ref(''),
  },
};

const handleRegister = async () => {
  if (validateFields(fields)) return;

  try {
    await authStore.register(fields.email.model.value, fields.password.model.value, fields.confirmPassword.model.value);
    navigateTo('Home');
  } catch (error) {
    console.error('Failed to register user', error);
  }
}
</script>

<style scoped lang="scss">
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>