<template>
  <v-btn
    :variant="vuetifyVariant"
    :color="effectiveColor"
    :class="textColorClass"
    :rounded="effectiveRounded"
    :size="size"
    :icon="iconShape"
    :block="block"
    :loading="loading"
    :disabled="disabled"

    v-bind="$attrs"
  >
    <!-- VBtn ignores its `icon` glyph when a default slot exists, so render it here. -->
    <slot>
      <v-icon
        v-if="icon"
        :icon="icon"
      />
    </slot>
  </v-btn>
</template>

<script lang="ts" setup>
// App-wide wrapper around v-btn; extra attrs (`to`, `href`, `aria-label`, …)
// fall through via $attrs.
type ButtonVariant
  = | 'primary'
    | 'secondary'
    | 'text'
    | 'outlined'
    | 'flat'
    | 'tonal'
    | 'plain'
    | 'elevated';
type ButtonSize = 'x-small' | 'small' | 'default' | 'large' | 'x-large';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
    color?: string;
    // Vuetify's `color` sets background AND text; this overrides just the text.
    textColor?: string;
    rounded?: string | boolean;
    /** Renders an icon-only button (Vuetify's `icon` prop), e.g. "mdi-close". */
    icon?: string;
  }>(),
  {
    variant: 'primary',
    size: 'default',
    block: false,
    loading: false,
    disabled: false,
    color: undefined,
    textColor: undefined,
    rounded: undefined,
    icon: undefined,
  },
);

const isSecondary = computed(() => props.variant === 'secondary');

const vuetifyVariant = computed(() => {
  switch (props.variant) {
    case 'primary': return 'flat' as const;
    case 'secondary': return 'outlined' as const;
    default: return props.variant;
  }
});

const effectiveColor = computed(() => {
  if (isSecondary.value) {
    // Treat legacy `color="white"` as unset.
    const tone = !props.color || props.color === 'white' ? 'on-surface' : props.color;
    // Vuetify's `color` prop knows palette names but not `on-*` tokens,
    // so resolve those to a real CSS colour.
    return resolveThemeColor(tone);
  }
  // Icon buttons with no `color` inherit the ambient text color.
  return props.color ?? (props.icon ? undefined : 'primary');
});

const effectiveRounded = computed(
  () => props.rounded ?? (props.icon ? undefined : 'pill'),
);

// Boolean shape only — the glyph renders via the template's slot fallback.
const iconShape = computed(() => (props.icon ? true : undefined));

const textColorClass = computed(() =>
  props.textColor ? `text-${props.textColor}` : undefined,
);
</script>

<style scoped lang="scss">
// Vuetify fixes v-btn height + nowrap, so long labels overflow the pill.
// Let them wrap; `min-height` keeps single-line buttons at their current size.
.v-btn:not(.v-btn--icon) {
  height: auto;
  min-height: var(--v-btn-height);
  padding-top: 6px;
  padding-bottom: 6px;
  text-transform: none;

  :deep(.v-btn__content) {
    white-space: normal;
    text-align: center;
    line-height: 1.25;
  }
}

// Keep `block` excluded — this scoped selector out-specifies Vuetify's
// `.v-btn--block { min-width: 100% }` and would silently break it.
.v-btn:not(.v-btn--icon):not(.v-btn--block) {
  min-width: 0;
}
</style>
