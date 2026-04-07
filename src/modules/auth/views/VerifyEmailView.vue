<template>
  <AuthLayout>
    <div class="verify-email">
      <Header />
      <div class="content">
        <div v-if="loading" class="status">
          <v-progress-circular indeterminate color="primary" />
          <span>{{ $t('auth_verifying_email') }}</span>
        </div>

        <div v-else-if="success" class="status success">
          <v-icon color="success" size="48">mdi-check-circle-outline</v-icon>
          <h2>{{ $t('auth_email_verified') }}</h2>
          <p>{{ $t('auth_email_verified_description') }}</p>
          <v-btn color="primary" @click="navigateTo('Login')">{{ $t('common_login') }}</v-btn>
        </div>

        <div v-else class="status error">
          <v-icon color="error" size="48">mdi-alert-circle-outline</v-icon>
          <h2>{{ $t('auth_verification_failed') }}</h2>
          <p>{{ errorMessage }}</p>
          <v-btn color="primary" variant="outlined" @click="navigateTo('Login')">{{ $t('auth_back_to_login') }}</v-btn>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useRouteHelpers } from '@/composables/useRouteHelpers';
import AuthLayout from '@/layouts/auth.vue';
import Header from '@/components/Header.vue';

const route = useRoute();
const authStore = useAuthStore();
const { navigateTo } = useRouteHelpers();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    loading.value = false;
    errorMessage.value = 'No verification token provided.';
    return;
  }

  try {
    await authStore.verifyEmail(token);
    success.value = true;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Verification failed.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.verify-email {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 400px;
}
</style>
