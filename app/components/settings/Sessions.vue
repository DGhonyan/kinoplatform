<template>
  <div class="sessions">
    <div
      v-if="loading"
      class="sessions-loading"
    >
      <v-progress-circular
        indeterminate
        size="24"
        width="3"
        color="primary"
      />
    </div>

    <template v-else>
      <ul class="session-list">
        <li
          v-for="session in sessions"
          :key="session.id"
          class="session"
        >
          <div class="session-info">
            <span class="session-device">{{ session.device || $t('settings_unknown_device') }}</span>
            <span class="session-meta">
              {{ session.ip || '—' }} · {{ formatDate(session.createdAt) }}
            </span>
          </div>

          <div class="session-action">
            <span
              v-if="session.current"
              class="session-current"
            >
              {{ $t('settings_this_device') }}
            </span>
            <Button
              v-else
              variant="secondary"
              color="white"
              size="small"
              :loading="revokingId === session.id"
              :disabled="busy"
              @click="revoke(session.id)"
            >
              {{ $t('settings_revoke') }}
            </Button>
          </div>
        </li>
      </ul>

      <div class="session-actions">
        <Button
          v-if="hasOthers"
          variant="secondary"
          color="white"
          size="small"
          :loading="revokingOthers"
          :disabled="busy"
          @click="revokeOthers"
        >
          {{ $t('settings_logout_other_sessions') }}
        </Button>
        <Button
          variant="secondary"
          color="white"
          size="small"
          :disabled="busy"
          @click="logout"
        >
          {{ $t('common_logout') }}
        </Button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Session } from '~~/shared/types/user';
import Button from '~/components/Button.vue';
import { formatDateTime } from '~/utils/dates';

const { locale } = useI18n();
const authStore = useAuthStore();

const sessions = ref<Session[]>([]);
const loading = ref(true);
const revokingId = ref('');
const revokingOthers = ref(false);

const busy = computed(() => !!revokingId.value || revokingOthers.value);
const hasOthers = computed(() => sessions.value.some(s => !s.current));

const formatDate = (iso: string) => formatDateTime(iso, locale.value);

const load = async () => {
  loading.value = true;
  const data = await authStore.listSessions();
  sessions.value = data ?? [];
  loading.value = false;
};

const revoke = async (id: string) => {
  revokingId.value = id;
  try {
    const ok = await authStore.revokeSession(id);
    if (ok) await load();
  }
  finally {
    revokingId.value = '';
  }
};

const revokeOthers = async () => {
  revokingOthers.value = true;
  try {
    const ok = await authStore.revokeOtherSessions();
    if (ok) await load();
  }
  finally {
    revokingOthers.value = false;
  }
};

const logout = async () => {
  await authStore.logout();
  await navigateTo('/login');
};

onMounted(load);
</script>

<style scoped lang="scss">
.sessions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sessions-loading {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.session-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid color(--v-theme-on-surface, 0.16);
  border-radius: 12px;
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  width: 100%;
}

.session-action {
  display: flex;
}

.session-device {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  font-size: 12px;
  opacity: 0.6;
}

.session-current {
  padding: 4px 8px;
  border-radius: 8px;
  background-color: color(--v-theme-primary);
  color: color(--v-theme-on-primary);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.session-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
