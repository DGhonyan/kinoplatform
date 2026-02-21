<template>
  <div class="login-form">
    <template v-for="field in Object.values(fields)" :key="field.label">
      <Input
        :type="field.type"
        :label="field.label"
        v-model="field.model.value"
        required
        :error-messages="field.errorMessages.value"
        hide-details="auto"
      />
    </template>

    <v-btn color="primary" @click="handleLogin">Login</v-btn>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Input from '@/components/Input.vue'
import { validateFields } from '@/common/utils'
import { useAuthStore } from '@/stores/auth'
import { useRouteHelpers } from '@/composables/useRouteHelpers'

const { navigateTo } = useRouteHelpers();

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
};

const handleLogin = async () => {
  if (validateFields(fields)) return;

  const authStore = useAuthStore();

  try {
    await authStore.login(fields.email.model.value, fields.password.model.value);
    navigateTo('Home');
  } catch (error) {
    console.error('Failed to login');
    return;
  }
}
</script>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>