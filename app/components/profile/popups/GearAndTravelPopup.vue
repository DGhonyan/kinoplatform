<template>
  <PopupShell
    v-model="open"
    :title="viewTitle"
    :description="view === 'list' ? $t('gear_description') : ''"
    :show-back="view !== 'list'"
    @back="view = 'list'"
  >
    <!-- ───────────────── List view ───────────────── -->
    <template v-if="view === 'list'">
      <FieldCard
        icon="custom:camera-add"
        title="gear_tools_label"
        description="gear_tools_description"
      >
        <div class="picker-field">
          <div
            v-if="tools.length"
            class="selected-chips"
          >
            <v-chip
              v-for="item in tools"
              :key="item"
              size="small"
              color="accent"
              closable
              @click:close="toggleTool(item)"
            >
              {{ item }}
            </v-chip>
          </div>
          <Button
            variant="secondary"
            color="accent"
            block
            prepend-icon="mdi-tune-variant"
            @click="view = 'tools'"
          >
            {{ tools.length ? $t('gear_edit_selection') : $t('gear_select_tools') }}
          </Button>
        </div>
      </FieldCard>

      <FieldCard
        icon="custom:camera-add"
        title="gear_equipment_label"
        description="gear_equipment_description"
      >
        <div class="picker-field">
          <div
            v-if="equipment.length"
            class="selected-chips"
          >
            <v-chip
              v-for="item in equipment"
              :key="item"
              size="small"
              color="accent"
              closable
              @click:close="toggleEquipment(item)"
            >
              {{ item }}
            </v-chip>
          </div>
          <Button
            variant="secondary"
            color="accent"
            block
            prepend-icon="mdi-tune-variant"
            @click="view = 'equipment'"
          >
            {{ equipment.length ? $t('gear_edit_selection') : $t('gear_select_equipment') }}
          </Button>
        </div>
      </FieldCard>

      <FieldCard
        icon="custom:camera-add"
        title="gear_practicalities_label"
        description="gear_practicalities_description"
      >
        <div class="picker-field">
          <div
            v-if="enabledPracticalities.length"
            class="selected-chips"
          >
            <v-chip
              v-for="key in enabledPracticalities"
              :key="key"
              size="small"
              color="accent"
            >
              {{ $t(`practicality_${key}`) }}
            </v-chip>
          </div>
          <Button
            variant="secondary"
            color="accent"
            block
            prepend-icon="mdi-tune-variant"
            @click="view = 'practicalities'"
          >
            {{ enabledPracticalities.length ? $t('gear_edit_selection') : $t('gear_set_practicalities') }}
          </Button>
        </div>
      </FieldCard>
    </template>

    <!-- ───────────────── Tools picker ───────────────── -->
    <ChipPicker
      v-else-if="view === 'tools'"
      v-model="tools"
      :groups="SOFTWARE_TOOL_GROUPS"
      :search-placeholder="$t('gear_search_tools')"
    />

    <!-- ───────────────── Equipment picker ───────────────── -->
    <ChipPicker
      v-else-if="view === 'equipment'"
      v-model="equipment"
      :groups="EQUIPMENT_GROUPS"
      :search-placeholder="$t('gear_search_equipment')"
    />

    <!-- ───────────────── Practicalities ───────────────── -->
    <div
      v-else
      class="practicalities"
    >
      <div
        v-for="group in practicalityGroups"
        :key="group.label"
        class="practicality-group"
      >
        <span class="group-title">{{ $t(group.label) }}</span>
        <v-switch
          v-for="key in group.keys"
          :key="key"
          v-model="practicalities[key]"
          color="primary"
          density="compact"
          hide-details
          :label="$t(`practicality_${key}`)"
        />
      </div>
    </div>

    <!-- ───────────────── Actions ───────────────── -->
    <template #actions>
      <template v-if="view === 'list'">
        <Button
          variant="secondary"
          color="accent"
          size="large"
          :disabled="saving"
          @click="open = false"
        >
          {{ $t('common_skip_for_now') }}
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
      <Button
        v-else
        color="accent"
        size="large"
        @click="view = 'list'"
      >
        {{ $t('common_done') }}
      </Button>
    </template>
  </PopupShell>
</template>

<script lang="ts" setup>
import { STEP_IDS } from '~/components/auth/registerSteps';
import { SOFTWARE_TOOL_GROUPS, EQUIPMENT_GROUPS } from '~/utils/gear';
import type { Practicalities } from '~~/shared/types/user';
import PopupShell from '~/components/profile/popups/PopupShell.vue';
import FieldCard from '~/components/profile/popups/FieldCard.vue';
import ChipPicker from '~/components/profile/popups/ChipPicker.vue';
import Button from '~/components/Button.vue';

type View = 'list' | 'tools' | 'equipment' | 'practicalities';

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  completed: [];
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();

const EMPTY_PRACTICALITIES: Practicalities = {
  willingToTravel: false,
  availableForLongShoots: false,
  passportAvailable: false,
  visaAvailable: false,
  drivingLicenseAvailable: false,
};

const view = ref<View>('list');
const tools = ref<string[]>([...(authStore.user?.tools ?? [])]);
const equipment = ref<string[]>([...(authStore.user?.equipment ?? [])]);
const practicalities = ref<Practicalities>({
  ...EMPTY_PRACTICALITIES,
  ...(authStore.user?.practicalities ?? {}),
});
const saving = ref(false);

const viewTitle = computed(() => {
  if (view.value === 'tools') return t('gear_tools_label');
  if (view.value === 'equipment') return t('gear_equipment_label');
  if (view.value === 'practicalities') return t('gear_practicalities_label');
  return t('gear_title');
});

const toggleTool = (item: string) => {
  tools.value = tools.value.filter(i => i !== item);
};
const toggleEquipment = (item: string) => {
  equipment.value = equipment.value.filter(i => i !== item);
};

// `keys` are Practicalities keys; label/title come from i18n (`practicality_<key>`).
const practicalityGroups: { label: string; keys: (keyof Practicalities)[] }[] = [
  { label: 'practicalities_travel_group', keys: ['willingToTravel', 'availableForLongShoots'] },
  { label: 'practicalities_documents_group', keys: ['passportAvailable', 'visaAvailable'] },
  { label: 'practicalities_driving_group', keys: ['drivingLicenseAvailable'] },
];

// Enabled practicality keys, for the summary chips on the list card.
const enabledPracticalities = computed(() =>
  practicalityGroups.flatMap(g => g.keys).filter(k => practicalities.value[k]),
);

const save = async () => {
  saving.value = true;
  try {
    const data = await userStore.updateUser({
      tools: tools.value,
      equipment: equipment.value,
      practicalities: practicalities.value,
      completeStep: STEP_IDS.GEAR,
    });
    if (!data) return;

    open.value = false;
    emit('completed');
  }
  finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.picker-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.practicalities {
  display: flex;
  flex-direction: column;
  gap: 16px;
  // The bare secondary view lost the FieldCard's padding; add a little inset.
  padding: 4px 8px;
}

.practicality-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

// Vuetify's switch control carries a negative inline inset (to align to a grid)
// that makes the toggles spill past the container's left edge — zero it, and
// keep the label from being clipped on the right.
.practicality-group :deep(.v-selection-control) {
  margin-inline-start: 0;
}

.practicality-group :deep(.v-label) {
  white-space: normal;
}

.group-title {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.75;
}
</style>
