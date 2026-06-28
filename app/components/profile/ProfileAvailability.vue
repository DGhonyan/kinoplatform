<template>
  <div class="availability-section">
    <div class="availability-header">
      <span class="section-title">{{ $t('profile_availability') }}</span>
      <Button
        v-if="canEdit"
        size="small"
        color="primary"
        @click="showDialog = true"
      >
        {{ hasAvailability ? $t('profile_edit_availability') : $t('profile_add_availability') }}
      </Button>
    </div>

    <div
      v-if="hasAvailability"
      class="calendar-wrapper"
    >
      <div class="calendar-controls">
        <Button
          icon="mdi-chevron-left"
          size="small"
          variant="text"
          @click="shiftMonth(-1)"
        />
        <span class="calendar-month-display">{{ formatMonthYear(focusedDate) }}</span>
        <Button
          icon="mdi-chevron-right"
          size="small"
          variant="text"
          @click="shiftMonth(1)"
        />
        <Button
          size="small"
          variant="text"
          class="today-btn"
          @click="focusedDate = new Date()"
        >
          {{ $t('common_today') }}
        </Button>
      </div>
      <v-calendar
        v-model="calendarDate"
        :events="calendarEvents"
        view-mode="month"
      />
    </div>
    <div
      v-else
      class="no-availability"
    >
      <span>{{ canEdit ? $t('profile_availability_description') : $t('profile_no_availability_information_added') }}</span>
    </div>

    <v-dialog
      v-model="showDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ $t('profile_manage_availability') }}</span>
        </v-card-title>
        <v-card-text>
          <v-form class="availability-form">
            <Input
              v-model="draft.title"
              label="common_title"
              required
              :error-messages="titleError"
              @update:model-value="titleError = ''"
            />
            <v-row>
              <v-col cols="6">
                <Input
                  v-model="draft.startDate"
                  label="common_start_date"
                  type="date"
                  required
                  :error-messages="startDateError"
                  @update:model-value="onStartDateChange"
                />
              </v-col>
              <v-col cols="6">
                <Input
                  v-model="draft.endDate"
                  label="common_end_date"
                  type="date"
                  required
                  :error-messages="endDateError"
                  @update:model-value="endDateError = ''"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <Input
                  v-model="draft.startTime"
                  label="profile_start_time"
                  type="time"
                />
              </v-col>
              <v-col cols="6">
                <Input
                  v-model="draft.endTime"
                  label="profile_end_time"
                  type="time"
                />
              </v-col>
            </v-row>
            <v-select
              v-model="draft.color"
              :label="$t('common_color')"
              :items="colorOptions"
              variant="outlined"
              hide-details
            />
          </v-form>

          <div
            v-if="validEvents.length > 0"
            class="existing-availability"
          >
            <h4>{{ $t('profile_current_availability') }}</h4>
            <div
              v-for="event in validEvents"
              :key="event._id"
              class="availability-item"
            >
              <div class="availability-item-info">
                <span class="availability-date">
                  {{ formatDate(event.startDate) }}
                  <template v-if="event.startDate !== event.endDate">
                    - {{ formatDate(event.endDate) }}
                  </template>
                </span>
                <span class="availability-title">{{ event.title }}</span>
                <span
                  v-if="event.startTime && event.endTime"
                  class="availability-time"
                >
                  {{ event.startTime }} - {{ event.endTime }}
                </span>
              </div>
              <Button
                size="small"
                color="error"
                variant="text"
                icon="mdi-delete"
                @click="removeEvent(event._id!)"
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <Button
            color="grey"
            variant="text"
            @click="closeDialog"
          >
            {{ $t('common_cancel') }}
          </Button>
          <Button
            color="primary"
            variant="text"
            @click="addEvent"
          >
            {{ $t('common_save') }}
          </Button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import type { Event } from '~~/shared/types/user';

/**
 * Availability calendar + editor, extracted from UserProfile. Self-contained:
 * loads its own events for `userId`. Currently hidden from the profile
 * (showAvailability flag) — kept as a component so it's a one-line revisit.
 */
const props = defineProps<{
  userId: string | undefined;
  canEdit: boolean;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();
const eventStore = useEventStore();

const events = ref<Event[]>([]);
const showDialog = ref(false);
const focusedDate = ref<Date | string | string[]>(new Date());

const draft = ref<Omit<Event, '_id' | 'userId'>>({
  startDate: '', endDate: '', title: '', color: 'primary', startTime: '', endTime: '',
});
const titleError = ref('');
const startDateError = ref('');
const endDateError = ref('');

const colorOptions = computed(() => [
  { title: t('common_primary'), value: 'primary' },
  { title: t('common_success'), value: 'success' },
  { title: t('common_warning'), value: 'warning' },
  { title: t('common_error'), value: 'error' },
  { title: t('common_info'), value: 'info' },
]);

const hasAvailability = computed(() => events.value.length > 0);
const validEvents = computed(() =>
  events.value.filter(e => e.startDate && e.endDate && e.title),
);
const calendarEvents = computed(() =>
  events.value
    .filter(e => e.startDate && e.endDate)
    .map(e => ({
      title: e.title,
      start: e.startTime ? `${e.startDate}T${e.startTime}` : e.startDate,
      end: e.endTime ? `${e.endDate}T${e.endTime}` : e.endDate,
      color: e.color || 'primary',
    })),
);

const normalizeDate = (date: Date | string | string[]): Date => {
  if (date instanceof Date) return date;
  if (Array.isArray(date)) return new Date(date[0] || new Date());
  if (typeof date === 'string') return new Date(date);
  return new Date();
};

const calendarDate = computed({
  get: () => normalizeDate(focusedDate.value),
  set: (v) => { focusedDate.value = v; },
});

const formatMonthYear = (date: Date | string | string[]) =>
  normalizeDate(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

const shiftMonth = (delta: number) => {
  const d = normalizeDate(focusedDate.value);
  d.setMonth(d.getMonth() + delta);
  focusedDate.value = d;
};

const loadEvents = async () => {
  const targetId = props.userId || authStore.user?._id;
  if (!targetId) return;
  const profile = await userStore.getUserProfile(targetId);
  if (profile) events.value = profile.events;
};

const onStartDateChange = (value: string) => {
  startDateError.value = '';
  if (!draft.value.endDate) draft.value.endDate = value;
  endDateError.value = draft.value.endDate && draft.value.endDate < value
    ? t('common_end_date_must_be_after_or_equal_to_start_date')
    : '';
};

const validateForm = (): boolean => {
  let ok = true;
  if (!draft.value.title) {
    titleError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (!draft.value.startDate) {
    startDateError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (!draft.value.endDate) {
    endDateError.value = t('common_this_field_is_required');
    ok = false;
  }
  if (draft.value.startDate && draft.value.endDate && draft.value.endDate < draft.value.startDate) {
    endDateError.value = t('common_end_date_must_be_after_or_equal_to_start_date');
    ok = false;
  }
  return ok;
};

const resetDraft = () => {
  draft.value = { startDate: '', endDate: '', title: '', color: 'primary', startTime: '', endTime: '' };
  titleError.value = '';
  startDateError.value = '';
  endDateError.value = '';
};

const closeDialog = () => {
  showDialog.value = false;
  resetDraft();
};

const addEvent = async () => {
  if (!validateForm()) return;
  const created = await eventStore.createEvent(draft.value);
  if (!created) return;
  await loadEvents();
  closeDialog();
};

const removeEvent = async (eventId: string) => {
  const ok = await eventStore.deleteEvent(eventId);
  if (!ok) return;
  await loadEvents();
};

onMounted(loadEvents);
watch(() => props.userId, loadEvents);
</script>

<style scoped lang="scss">
.availability-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 500;
}

.availability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.calendar-month-display {
  font-size: 18px;
  font-weight: 500;
  min-width: 180px;
  text-align: center;
}

.today-btn {
  margin-left: auto;
}

.no-availability {
  padding: 24px;
  text-align: center;
  font-size: 14px;
  border: 1px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 8px;
}

.availability-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.existing-availability {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h4 {
    font-size: 16px;
    font-weight: 500;
  }
}

.availability-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 4px;
}

.availability-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.availability-date {
  font-weight: 500;
  color: color(--v-theme-primary);
}

.availability-title {
  font-size: 14px;
}

.availability-time {
  font-size: 12px;
  opacity: 0.7;
}
</style>
