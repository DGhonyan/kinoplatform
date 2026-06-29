<template>
  <!-- Routes to the profile; the global auth middleware bounces guests to /login. -->
  <button
    type="button"
    class="user-card"
    @click="navigateTo(`/users/${user._id}`)"
  >
    <img
      :src="avatarSrc"
      :alt="`${user.firstName} ${user.lastName}`"
      class="avatar"
    >
    <div class="user-info">
      <h3 class="user-name">
        {{ user.firstName }} {{ user.lastName }}
      </h3>
      <p class="user-profession">
        {{ (user.profession ?? []).map(p => $t(p)).join(' | ') }}
      </p>
    </div>
  </button>
</template>

<script lang="ts" setup>
import type { User } from '~~/shared/types/user';

const props = defineProps<{ user: User }>();

const avatarSrc = computed(
  () => props.user.avatar || new URL('@/assets/default.jpg', import.meta.url).href,
);
</script>

<style scoped lang="scss">
.user-card {
  // Fixed size; `flex: none` keeps it from shrinking inside a flex-wrap grid.
  flex: 0 0 auto;
  width: 200px;
  height: 290px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: color(--v-theme-on-surface, 0.04);
  border: 1px solid color(--v-theme-on-surface, 0.12);
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    border-color: color(--v-theme-primary, 0.3);
  }
}

.avatar {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: color(--v-theme-on-surface, 0.87);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-profession {
  margin: 0;
  font-size: 14px;
  // Cap at two lines so cards stay uniform height regardless of role count.
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
