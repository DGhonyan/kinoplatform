<template>
  <div class="recommendations">
    <!-- Leave / edit your recommendation (logged-in, onboarded visitors only). -->
    <div
      v-if="canLeave"
      class="leave"
    >
      <span class="leave-label">
        {{ myRecommendation ? $t('recommendation_edit_yours') : $t('recommendation_leave') }}
      </span>
      <TextArea
        v-model="text"
        color="accent"
        :placeholder="$t('recommendation_placeholder')"
        :counter="MAX"
        :maxlength="MAX"
        :rows="2"
        auto-grow
        hide-details="auto"
        :error-messages="error"
        @update:model-value="onInput"
      />
      <div class="leave-actions">
        <Button
          color="accent"
          size="small"
          :loading="saving"
          :disabled="!text.trim()"
          @click="save"
        >
          {{ myRecommendation ? $t('common_save') : $t('recommendation_submit') }}
        </Button>
      </div>
    </div>

    <!-- Carousel of recommendation cards. -->
    <v-slide-group
      v-if="recommendations.length"
      show-arrows
      class="carousel"
    >
      <v-slide-group-item
        v-for="rec in recommendations"
        :key="rec._id"
      >
        <div class="rec-card">
          <div class="rec-head">
            <NuxtLink
              :to="`/users/${rec.author._id}`"
              class="rec-author"
            >
              <img
                :src="authorAvatar(rec)"
                alt=""
                class="rec-avatar"
              >
              <span class="rec-name">{{ rec.author.firstName }} {{ rec.author.lastName }}</span>
            </NuxtLink>
            <Button
              v-if="canDelete(rec)"
              icon="mdi-close"
              variant="text"
              size="x-small"
              :aria-label="$t('common_delete')"
              @click="removeRec(rec._id)"
            />
          </div>
          <p class="rec-text">
            {{ rec.text }}
          </p>
        </div>
      </v-slide-group-item>
    </v-slide-group>

    <p
      v-else-if="!canLeave"
      class="empty"
    >
      {{ $t('recommendation_none') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { Recommendation } from '~~/shared/types/user';
import { isOnboardingComplete } from '~/utils/onboarding';
import Button from '~/components/Button.vue';

const props = defineProps<{
  targetId: string;
  recommendations: Recommendation[];
  /** True when the viewer is looking at their OWN profile. */
  isOwner: boolean;
}>();

const emit = defineEmits<{ changed: [] }>();

const MAX = 250;

const authStore = useAuthStore();
const recommendationStore = useRecommendationStore();

// The viewer may leave one only on someone else's profile, once onboarded.
const canLeave = computed(() =>
  !props.isOwner && !!authStore.user && isOnboardingComplete(authStore.user),
);

// The viewer's existing recommendation (if any) — prefills the input for editing.
const myRecommendation = computed(() =>
  props.recommendations.find(r => r.author._id === authStore.user?._id),
);

const text = ref(myRecommendation.value?.text ?? '');
const error = ref('');
const saving = ref(false);
// Tracks unsent edits, so an unrelated profile reload (e.g. deleting someone
// else's card) doesn't wipe what the visitor is mid-way through typing.
const dirty = ref(false);

// Re-seed the input when the data loads/changes, but never over a live draft.
watch(myRecommendation, (rec) => {
  if (!dirty.value) text.value = rec?.text ?? '';
});

const onInput = () => {
  error.value = '';
  dirty.value = true;
};

const authorAvatar = (rec: Recommendation) =>
  rec.author.avatar || new URL('@/assets/default.jpg', import.meta.url).href;

// Owner can delete any recommendation on their profile; an author can delete theirs.
const canDelete = (rec: Recommendation) =>
  props.isOwner || rec.author._id === authStore.user?._id;

const save = async () => {
  const value = text.value.trim();
  if (!value) return;
  if (value.length > MAX) {
    error.value = 'recommendation_too_long';
    return;
  }

  saving.value = true;
  try {
    const data = await recommendationStore.save(props.targetId, value);
    if (!data) return;
    // Saved — let the reload re-seed the box to the persisted value.
    dirty.value = false;
    emit('changed');
  }
  finally {
    saving.value = false;
  }
};

const removeRec = async (id: string) => {
  const ok = await recommendationStore.remove(id);
  if (!ok) return;
  emit('changed');
};
</script>

<style scoped lang="scss">
.recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leave {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leave-label {
  font-size: 14px;
  font-weight: 500;
}

.leave-actions {
  display: flex;
  justify-content: flex-end;
}

.carousel {
  // v-slide-group overflows horizontally; keep the arrows reachable.
  width: 100%;
}

.rec-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 280px;
  min-height: 140px;
  margin-right: 12px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background-color: rgba(var(--v-theme-on-surface), 0.03);
}

.rec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.rec-author {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

.rec-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.rec-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rec-text {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
  overflow-wrap: anywhere;
}

.empty {
  font-size: 14px;
  opacity: 0.6;
  margin: 0;
}
</style>
