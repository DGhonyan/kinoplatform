<template>
  <v-dialog
    v-model="open"
    max-width="400px"
  >
    <v-card rounded="lg">
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>
      <v-card-text v-if="text">
        {{ text }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <Button
          variant="text"
          color="white"
          :disabled="loading"
          @click="open = false"
        >
          {{ cancelLabel || $t('common_cancel') }}
        </Button>
        <Button
          :color="confirmColor"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </Button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import Button from '~/components/Button.vue';

/**
 * Shared yes/no confirmation dialog for destructive/irreversible actions
 * (logout, clear availability, …). The caller owns the async work: it handles
 * `@confirm`, drives `loading`, and closes via `v-model` when done — so the
 * spinner shows and the dialog only dismisses on success. Labels are passed
 * already-translated (via `$t`) so this component stays copy-agnostic.
 */
const open = defineModel<boolean>({ required: true });

withDefaults(
  defineProps<{
    title: string;
    text?: string;
    confirmLabel: string;
    /** Vuetify color for the confirm button — use 'error' for destructive actions. */
    confirmColor?: string;
    cancelLabel?: string;
    loading?: boolean;
  }>(),
  {
    text: '',
    confirmColor: 'primary',
    cancelLabel: '',
    loading: false,
  },
);

const emit = defineEmits<{ confirm: [] }>();
</script>
