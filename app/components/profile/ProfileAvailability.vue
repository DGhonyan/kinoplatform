<template>
  <div class="availability">
    <div class="calendar-panel">
      <div class="calendar-controls">
        <Button
          class="nav-btn"
          icon="mdi-chevron-left"
          color="primary"
          size="small"
          :aria-label="$t('availability_prev_month')"
          @click="shiftMonth(-1)"
        />
        <span class="month-label">{{ monthLabel }}</span>
        <Button
          class="nav-btn"
          icon="mdi-chevron-right"
          color="primary"
          size="small"
          :aria-label="$t('availability_next_month')"
          @click="shiftMonth(1)"
        />
      </div>

      <div class="weekday-row">
        <span
          v-for="(wd, i) in weekdays"
          :key="i"
          class="weekday"
        >{{ wd }}</span>
      </div>

      <div class="day-grid">
        <template
          v-for="(cell, i) in cells"
          :key="i"
        >
          <div
            v-if="!cell"
            class="day-cell empty"
          />
          <button
            v-else
            type="button"
            class="day-cell interactive"
            :class="[
              `status-${dayStatus(cell.date)}`,
              {
                selected: cell.date === selectedDate,
                today: cell.date === todayStr,
              },
            ]"
            :aria-pressed="cell.date === selectedDate"
            @click="selectDay(cell.date)"
          >
            {{ cell.day }}
          </button>
        </template>
      </div>

      <div class="legend">
        <span class="legend-item"><span class="dot status-available" />{{ $t('availability_legend_available') }}</span>
        <span class="legend-item"><span class="dot status-partial" />{{ $t('availability_legend_partial') }}</span>
        <span class="legend-item"><span class="dot status-unavailable" />{{ $t('availability_legend_unavailable') }}</span>
      </div>

      <div
        v-if="canEdit && windows.length"
        class="calendar-footer"
      >
        <Button
          variant="secondary"
          color="white"
          size="small"
          @click="showClearConfirm = true"
        >
          {{ $t('availability_clear_all') }}
        </Button>
      </div>
    </div>

    <!-- Owner-only editor for the selected day -->
    <div
      v-if="canEdit"
      class="editor-panel"
    >
      <template v-if="selectedDate">
        <h3 class="editor-title">
          {{ formatFullDate(selectedDate) }}
        </h3>

        <!-- Existing windows on this day -->
        <ul
          v-if="selectedWindows.length"
          class="window-list"
        >
          <li
            v-for="w in selectedWindows"
            :key="w._id"
            class="window-item"
          >
            <div class="window-info">
              <span class="window-time">
                {{ w.allDay ? $t('availability_all_day') : `${w.startTime} – ${w.endTime}` }}
              </span>
              <span
                v-if="w.note"
                class="window-note"
              >{{ w.note }}</span>
            </div>
            <Button
              icon="mdi-close"
              variant="text"
              size="x-small"
              color="error"
              :aria-label="$t('common_delete')"
              @click="removeWindow(w._id!)"
            />
          </li>
        </ul>
        <p
          v-else
          class="no-windows"
        >
          {{ $t('availability_no_windows') }}
        </p>

        <!-- Add a window -->
        <form
          class="window-form"
          @submit.prevent="addWindow"
        >
          <v-switch
            v-model="draft.allDay"
            :label="$t('availability_all_day')"
            color="primary"
            density="comfortable"
            hide-details
            inset
          />

          <div
            v-if="!draft.allDay"
            class="time-row"
          >
            <Input
              v-model="draft.startTime"
              color="primary"
              type="time"
              label="availability_start_time"
              hide-details="auto"
              @update:model-value="timeError = ''"
            />
            <Input
              v-model="draft.endTime"
              color="primary"
              type="time"
              label="availability_end_time"
              hide-details="auto"
              @update:model-value="timeError = ''"
            />
          </div>
          <span
            v-if="timeError"
            class="time-error"
          >{{ timeError }}</span>

          <TextArea
            v-model="draft.note"
            color="primary"
            label="availability_note"
            :placeholder="$t('availability_note_placeholder')"
            :maxlength="500"
            :rows="2"
            auto-grow
            hide-details="auto"
          />

          <Button
            color="white"
            variant="secondary"
            :loading="saving"
            @click="addWindow"
          >
            {{ $t('availability_add_window') }}
          </Button>
        </form>
      </template>

      <p
        v-else
        class="select-hint"
      >
        {{ $t('availability_select_day_hint') }}
      </p>
    </div>

    <!-- Read-only view of the selected day's windows (non-owner / booker). -->
    <div
      v-else
      class="editor-panel"
    >
      <template v-if="selectedDate">
        <h3 class="editor-title">
          {{ formatFullDate(selectedDate) }}
        </h3>
        <ul
          v-if="selectedWindows.length"
          class="window-list"
        >
          <li
            v-for="w in selectedWindows"
            :key="w._id"
            class="window-item"
          >
            <span class="window-time">
              {{ w.allDay ? $t('availability_all_day') : `${w.startTime} – ${w.endTime}` }}
            </span>
          </li>
        </ul>
        <p
          v-else
          class="no-windows"
        >
          {{ $t('availability_no_windows') }}
        </p>
      </template>
    </div>

    <!-- Clear-all is destructive (wipes the whole calendar) — confirm first. -->
    <ConfirmDialog
      v-model="showClearConfirm"
      :title="$t('availability_clear_confirm_title')"
      :text="$t('availability_clear_confirm_text')"
      :confirm-label="$t('availability_clear_all')"
      confirm-color="error"
      :loading="clearing"
      @confirm="clearAll"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Availability } from '~~/shared/types/user';
import Button from '~/components/Button.vue';
import Input from '~/components/Input.vue';
import TextArea from '~/components/TextArea.vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';
import { formatDate, formatMonthYear } from '~/utils/dates';
import {
  groupWindowsByDate,
  dayStatus as computeDayStatus,
  type DayStatus,
} from '~/utils/availability';

/**
 * Availability calendar. A month grid of day tiles coloured by status —
 * available (an all-day window), partially available (some windows), or
 * unavailable (none) — derived from the user's availability windows. The owner
 * gets a per-day editor to add/remove windows; other viewers see it read-only.
 */
const props = defineProps<{
  userId: string | undefined;
  canEdit: boolean;
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const availabilityStore = useAvailabilityStore();

const pad = (n: number) => String(n).padStart(2, '0');
// Build 'YYYY-MM-DD' from parts directly (month is 0-based) — never via
// toISOString, which shifts to UTC and can land on the wrong day.
const toDateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const now = new Date();
const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

const windows = ref<Availability[]>([]);
const focused = ref(new Date(now.getFullYear(), now.getMonth(), 1));
const selectedDate = ref<string | null>(todayStr);
const saving = ref(false);
const clearing = ref(false);
const showClearConfirm = ref(false);

const draft = reactive({ allDay: false, startTime: '', endTime: '', note: '' });
const timeError = ref('');

// Localized Mon–Sun headers (Jan 1 2024 was a Monday).
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(locale.value, { weekday: 'short' }),
  ),
);

const monthLabel = computed(() => formatMonthYear(focused.value, locale.value));

// Always a fixed 6×7 grid (42 cells) so the calendar height — and the popup it
// sits in — never changes between months. Leading/trailing slots are null (blank
// tiles); 6 rows is the max any month needs, so nothing ever overflows.
const cells = computed(() => {
  const y = focused.value.getFullYear();
  const m = focused.value.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // Mon = 0

  const result: ({ date: string; day: number } | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) result.push(null);
  for (let d = 1; d <= daysInMonth; d++) result.push({ date: toDateStr(y, m, d), day: d });
  while (result.length < 42) result.push(null);
  return result;
});

const windowsByDate = computed(() => groupWindowsByDate(windows.value));

const dayStatus = (date: string): DayStatus =>
  computeDayStatus(windowsByDate.value[date]);

const selectedWindows = computed(() =>
  selectedDate.value ? windowsByDate.value[selectedDate.value] ?? [] : [],
);

const formatFullDate = (date: string) => formatDate(date, locale.value);

const resetDraft = () => {
  draft.allDay = false;
  draft.startTime = '';
  draft.endTime = '';
  draft.note = '';
  timeError.value = '';
};

const shiftMonth = (delta: number) => {
  focused.value = new Date(focused.value.getFullYear(), focused.value.getMonth() + delta, 1);
};

const selectDay = (date: string) => {
  selectedDate.value = date;
  if (props.canEdit) resetDraft();
};

const load = async () => {
  const targetId = props.userId || authStore.user?._id;
  if (!targetId) return;
  const data = await availabilityStore.listAvailability(targetId);
  windows.value = data ?? [];
};

const addWindow = async () => {
  if (saving.value || !selectedDate.value) return;

  timeError.value = '';
  if (!draft.allDay) {
    if (!draft.startTime || !draft.endTime) {
      timeError.value = t('common_all_fields_are_required');
      return;
    }
    if (draft.startTime >= draft.endTime) {
      timeError.value = t('availability_invalid_window');
      return;
    }
  }

  saving.value = true;
  try {
    const created = await availabilityStore.createAvailability({
      date: selectedDate.value,
      allDay: draft.allDay,
      startTime: draft.allDay ? undefined : draft.startTime,
      endTime: draft.allDay ? undefined : draft.endTime,
      note: draft.note.trim() || undefined,
    });
    if (!created) return;
    resetDraft();
    await load();
  }
  finally {
    saving.value = false;
  }
};

const removeWindow = async (id: string) => {
  const ok = await availabilityStore.deleteAvailability(id);
  if (ok) await load();
};

const clearAll = async () => {
  clearing.value = true;
  try {
    const ok = await availabilityStore.clearAvailability();
    if (ok) await load();
  }
  finally {
    clearing.value = false;
    showClearConfirm.value = false;
  }
};

onMounted(load);
watch(() => props.userId, load);
</script>

<style scoped lang="scss">
// Availability status palette — single source for both day tiles and legend dots.
$status-available: #f4efe6;
$status-partial: #e0a15e;
$status-unavailable: color(--v-theme-on-surface, 0.1);
$status-unavailable-dot: color(--v-theme-on-surface, 0.3);
$status-selected: #3f6b53;

.availability {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.calendar-panel {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.nav-btn {
  flex-shrink: 0;
}

.month-label {
  font-size: 20px;
  font-weight: 700;
  min-width: 160px;
  text-align: center;
}

.weekday-row,
.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
  text-transform: capitalize;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  border: 2px solid transparent;
  transition: transform 0.1s ease, box-shadow 0.1s ease;

  &.empty {
    visibility: hidden;
  }

  // Status colours.
  &.status-available {
    background-color: $status-available;
    color: #1a1a1a;
  }

  &.status-partial {
    background-color: $status-partial;
    color: #1a1a1a;
  }

  &.status-unavailable {
    background-color: $status-unavailable;
    color: color(--v-theme-on-surface, 0.55);
  }

  &.today {
    border-color: color(--v-theme-on-surface, 0.4);
  }

  &.interactive {
    cursor: pointer;
    font-family: inherit;

    &:hover {
      transform: translateY(-1px);
    }
  }

  // Selected wins over status colour (matches the design's green highlight).
  &.selected {
    background-color: $status-selected;
    color: #fff;
    border-color: $status-selected;
  }
}

.legend {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;

  &.status-available { background-color: $status-available; }
  &.status-partial { background-color: $status-partial; }
  &.status-unavailable { background-color: $status-unavailable-dot; }
}

.calendar-footer {
  display: flex;
  padding-top: 4px;
}

.editor-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.window-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.window-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid color(--v-theme-on-surface, 0.16);
  border-radius: 10px;
}

.window-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.window-time {
  font-size: 14px;
  font-weight: 500;
}

.window-note {
  font-size: 12px;
  opacity: 0.7;
  overflow-wrap: anywhere;
}

.no-windows {
  font-size: 13px;
  opacity: 0.6;
  margin: 0;
}

.window-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid color(--v-theme-on-surface, 0.12);
}

.time-row {
  display: flex;
  gap: 12px;

  > * {
    flex: 1;
  }
}

.time-error {
  font-size: 12px;
  color: color(--v-theme-error);
}

.select-hint {
  font-size: 14px;
  opacity: 0.6;
}

@include mobile {
  .availability {
    gap: 20px;
  }

  // The 300px floor would put the whole popup into a horizontal scroll.
  .calendar-panel {
    min-width: 0;
  }

  .calendar-controls {
    gap: 8px;
  }

  .month-label {
    min-width: 0;
    font-size: 17px;
  }

  .weekday-row,
  .day-grid {
    gap: 4px;
  }

  .day-cell {
    font-size: 14px;
    border-radius: 8px;
  }

  .legend {
    gap: 12px;
  }

  .editor-panel {
    width: 100%;
  }

  .time-row {
    flex-direction: column;
  }
}
</style>
