<template>
  <v-btn
    :variant="vuetifyVariant"
    :color="color"
    :class="textColorClass"
    :rounded="rounded"
    :size="size"
    :block="block"
    :loading="loading"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts" setup>
/**
 * App-wide button wrapper around v-btn.
 *
 * Why this exists: every consumer typing `<Button>` instead of `<v-btn>` keeps the
 * Vuetify dependency a private implementation detail. If we ever swap the inner
 * v-btn for a hand-rolled button (perf, design, library change), we change this
 * one file — call sites stay still.
 *
 * Defaults match the project's design language (pill-shaped, primary color).
 * Any unrecognised attribute (e.g. `to`, `href`, `prepend-icon`, `type`) falls
 * through to the underlying v-btn via $attrs.
 *
 * Variant semantics:
 *   - 'primary'   → filled, the main call-to-action ("Log In", "Next")
 *   - 'secondary' → outlined, supporting actions ("Go back", "Cancel")
 *   - 'text'      → no chrome, for inline links / low-emphasis actions
 *
 * Size maps directly to Vuetify's size scale; defaults to 'default'.
 */
type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'small' | 'default' | 'large';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
    color?: string;
    /**
     * Decouples text color from background. Vuetify's `color` prop sets both —
     * filled variants get a contrasting text color computed from the theme's
     * `on-<color>` token, which is always white/black. Pass `textColor` to
     * override that with any theme color (e.g. `color="white" text-color="primary"`
     * for a white button with maroon text). Maps to Vuetify's `text-<name>`
     * utility class.
     */
    textColor?: string;
    rounded?: string | boolean;
  }>(),
  {
    variant: 'primary',
    size: 'default',
    block: false,
    loading: false,
    disabled: false,
    color: 'primary',
    textColor: undefined,
    rounded: 'pill',
  },
);

const vuetifyVariant = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'outlined' as const;
    case 'text': return 'text' as const;
    case 'primary':
    default: return 'flat' as const;
  }
});

const textColorClass = computed(() =>
  props.textColor ? `text-${props.textColor}` : undefined,
);
</script>
