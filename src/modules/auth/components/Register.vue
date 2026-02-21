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
import { ref } from 'vue'
import Input from '@/components/Input.vue'
import { useApi } from '@/common/api'
import { validateFields } from '@/common/utils'

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

  const { data, error } = await useApi('/user/create').post({
    email: fields.email.model.value,
    password: fields.password.model.value,
    confirmPassword: fields.confirmPassword.model.value,
  });

  if (!data.value || error.value) {
    console.error('Failed to register user');
    return;
  }

  console.log('User registered successfully');
}
</script>

<style scoped lang="scss">
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>