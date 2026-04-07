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

    <v-btn color="primary" @click="handleRegister">{{ $t('common_register') }}</v-btn>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Input from '@/components/Input.vue';
import { validateFields } from '@/common/utils';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const appStore = useAppStore();
const { t } = useI18n();

const emit = defineEmits<{
  registered: [email: string];
}>();

const fields = {
  email: {
    model: ref(''),
    label: 'common_email',
    type: 'email',
    errorMessages: ref(''),
  },
  password: {
    model: ref(''),
    label: 'register_password_min_length',
    type: 'password',
    errorMessages: ref(''),
  },
  confirmPassword: {
    model: ref(''),
    label: 'register_confirm_password',
    type: 'password',
    errorMessages: ref(''),
  },
};

const handleRegister = async () => {
  if (validateFields(fields, t)) return;

  try {
    await authStore.register(fields.email.model.value, fields.password.model.value, fields.confirmPassword.model.value);
    appStore.showMessage('auth_registration_success', 'success');
    emit('registered', fields.email.model.value);
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
