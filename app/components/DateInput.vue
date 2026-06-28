<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    transition="scale-transition"
    location="bottom"
  >
    <template #activator="{ props: menuProps }">
      <Input
        v-bind="menuProps"
        :model-value="displayValue"
        :placeholder="placeholder"
        :error-messages="errorMessages"
        :required="required"
        :hide-details="hideDetails"
        readonly
      >
        <template #prepend-inner>
          <slot name="prepend-inner">
            <v-icon
              v-if="prependIcon"
              :icon="prependIcon"
            />
          </slot>
        </template>
      </Input>
    </template>

    <v-date-picker
      v-model:view-mode="viewMode"
      :model-value="dateValue"
      :min="minDate"
      :max="maxDate"
      class="weekdays-primary"
      elevation="5"
      weekday-format="short"
      hide-header
      hide-actions
      @update:model-value="onPick"
    >
      <template #controls="{ disabled, nextMonth, prevMonth, monthYearText }">
        <Button
          :disabled="viewMode !== 'month' || disabled.includes('prev-month')"
          color="primary"
          icon="$prev"
          @click="prevMonth"
        />
        <v-spacer />
        <button
          type="button"
          class="month-year-toggle text-center"
          @click="toggleView"
        >
          <div class="text-body-small my-n1 text-primary">
            {{ monthYearText.split(' ')[1] }}
          </div>
          <div class="text-body-large">
            {{ monthYearText.split(' ')[0] }}
          </div>
        </button>
        <v-spacer />
        <Button
          :disabled="viewMode !== 'month' || disabled.includes('next-month')"
          color="primary"
          icon="$next"
          @click="nextMonth"
        />
      </template>
    </v-date-picker>
  </v-menu>
</template>

<script lang="ts" setup>
/**
 * Date input wrapper around v-text-field + v-date-picker.
 *
 * Why this exists: keeps Vuetify's date-picker dependency private, gives us
 * a consistent calendar UX across the app, and lets us swap implementations
 * later in one place.
 *
 * v-model contract: ISO 8601 date string (`"1990-05-15"`). Empty string when
 * cleared. The wrapper handles all conversion between ISO strings and the
 * Date objects v-date-picker wants — using local components so timezone
 * shifts don't bump the date by a day.
 *
 * `prependIcon` renders an icon inside the field on the left. For fully
 * custom content, use the `prepend-inner` slot.
 */
const modelValue = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    errorMessages?: string | string[];
    required?: boolean;
    hideDetails?: boolean | 'auto';
    min?: string;
    max?: string;
    prependIcon?: string;
  }>(),
  {
    placeholder: '',
    errorMessages: undefined,
    required: false,
    hideDetails: 'auto',
    min: undefined,
    max: undefined,
    prependIcon: undefined,
  },
);

const menuOpen = ref(false);
const viewMode = ref<'month' | 'months' | 'year'>('month');

// Tapping the month/year label in the controls flips between the calendar
// grid and the year picker — so users can jump decades for birthdates
// without clicking the prev button 400 times.
const toggleView = () => {
  viewMode.value = viewMode.value === 'month' ? 'year' : 'month';
};

// Parse YYYY-MM-DD into a Date using local components — avoids the timezone
// shift that `new Date("1990-05-15")` causes in regions behind UTC.
const parseIsoDate = (iso: string | undefined): Date | undefined => {
  if (!iso) return undefined;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

// Format a Date back to YYYY-MM-DD using local components (same reason).
const toIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const dateValue = computed(() => parseIsoDate(modelValue.value));
const minDate = computed(() => parseIsoDate(props.min));
const maxDate = computed(() => parseIsoDate(props.max));

const displayValue = computed(() => {
  const date = dateValue.value;
  if (!date) return '';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
});

const onPick = (newDate: Date | string | number | undefined) => {
  if (!newDate) {
    modelValue.value = '';
    return;
  }
  const date = newDate instanceof Date ? newDate : new Date(newDate);
  if (Number.isNaN(date.getTime())) return;
  modelValue.value = toIsoDate(date);
  menuOpen.value = false;
};
</script>

<style scoped lang="scss">
.weekdays-primary :deep(.v-date-picker-month__weekday) {
  color: rgb(var(--v-theme-primary));
}

.month-year-toggle {
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }
}
</style>
