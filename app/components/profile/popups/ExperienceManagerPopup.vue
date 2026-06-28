<template>
  <PopupShell
    v-model="open"
    :title="view === 'list' ? $t('profile_experience') : $t('onboarding_experience_title')"
    :show-back="view === 'form' && mode === 'list'"
    @back="view = 'list'"
  >
    <template v-if="view === 'list'">
      <ProfileListSection
        :items="experience"
        :add-label="$t('onboarding_add_experience')"
        @add="startAdd"
        @edit="startEdit"
        @remove="remove"
      >
        <template #item="{ item }">
          {{ experienceSummary(item) }}
        </template>
      </ProfileListSection>
    </template>

    <ExperienceForm
      v-else
      ref="formRef"
      :key="`experience-${editingIndex ?? 'new'}`"
      :initial="editingExperience"
    />

    <template #actions>
      <template v-if="view === 'list'">
        <Button
          variant="secondary"
          color="accent"
          size="large"
          :disabled="saving"
          @click="open = false"
        >
          {{ $t('common_cancel') }}
        </Button>
        <Button
          color="accent"
          size="large"
          :loading="saving"
          @click="save"
        >
          {{ $t('common_save') }}
        </Button>
      </template>
      <template v-else>
        <Button
          variant="secondary"
          color="accent"
          size="large"
          :disabled="saving"
          @click="cancelForm"
        >
          {{ $t('common_cancel') }}
        </Button>
        <Button
          color="accent"
          size="large"
          :loading="saving"
          @click="doneForm"
        >
          {{ $t('common_done') }}
        </Button>
      </template>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import type { Experience } from '~~/shared/types/user';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import ProfileListSection from '~/components/profile/popups/ProfileListSection.vue';
import ExperienceForm from '~/components/profile/popups/ExperienceForm.vue';
import Button from '~/components/Button.vue';

/**
 * Profile-side manager for the user's work experience: list with add/edit/remove,
 * an experience form (reused from onboarding), and a single save through
 * `updateUser({ experience })`. `mode="add"` jumps straight to a blank form.
 */
const open = defineModel<boolean>({ required: true });

const props = withDefaults(
  defineProps<{ mode?: 'list' | 'add' }>(),
  { mode: 'list' },
);

const emit = defineEmits<{ saved: [] }>();

const authStore = useAuthStore();
const userStore = useUserStore();

type FormExposed = { commit: () => Experience | null };

const experience = ref<Experience[]>(JSON.parse(JSON.stringify(authStore.user?.experience ?? [])));
const saving = ref(false);
const view = ref<'list' | 'form'>(props.mode === 'add' ? 'form' : 'list');

const formRef = ref<FormExposed | null>(null);
const editingIndex = ref<number | null>(null);
const editingExperience = computed(() =>
  editingIndex.value !== null ? experience.value[editingIndex.value] : undefined,
);

const experienceSummary = (e: Experience) => `${e.position} · ${e.company}`;

const startAdd = () => {
  editingIndex.value = null;
  view.value = 'form';
};
const startEdit = (index: number) => {
  editingIndex.value = index;
  view.value = 'form';
};
const remove = (index: number) => {
  experience.value = experience.value.filter((_, i) => i !== index);
};
const applyDraft = (): boolean => {
  const exp = formRef.value?.commit();
  if (!exp) return false;
  if (editingIndex.value === null) {
    experience.value = [...experience.value, exp];
  }
  else {
    experience.value = experience.value.map((e, i) => (i === editingIndex.value ? exp : e));
  }
  return true;
};

// list-mode: commit returns to the list (list Save persists). add-mode: the form
// IS the popup — commit then save+close; Cancel/close just dismisses.
const doneForm = async () => {
  if (!applyDraft()) return;
  if (props.mode === 'add') await save();
  else view.value = 'list';
};
const cancelForm = () => {
  if (props.mode === 'add') open.value = false;
  else view.value = 'list';
};

const save = async () => {
  saving.value = true;
  try {
    const data = await userStore.updateUser({ experience: experience.value });
    if (!data) return;
    open.value = false;
    emit('saved');
  }
  finally {
    saving.value = false;
  }
};
</script>
