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
    <!-- Render the icon glyph ourselves. VBtn only falls back to its `icon` prop
         when NO default slot is passed, but this wrapper always passes one, so a
         string icon would otherwise never show. `icon` goes to VBtn as a boolean
         (shape only); the glyph comes from this slot fallback. -->
    <slot>
      <v-icon
        v-if="icon"
        :icon="icon"
      />
    </slot>
  </v-btn>
</template>

<script lang="ts" setup>
/**
 * App-wide button wrapper around v-btn — the single place the Vuetify button
 * dependency lives, so call sites say `<Button>` and never `<v-btn>`.
 *
 * Designed to cover every button shape so raw `<v-btn>` is never needed:
 *   - CTAs:    `<Button color="accent">Save</Button>` (filled, pill)
 *   - text:    `<Button variant="text" color="primary">Cancel</Button>`
 *   - outline: `<Button variant="secondary">Back</Button>`
 *   - icon:    `<Button icon="mdi-close" variant="text" aria-label="…" />`
 *   - link:    `<Button to="/x">Go</Button>` (`to`/`href` fall through via $attrs)
 *
 * `variant` accepts the semantic names AND Vuetify's raw ones:
 *   - 'primary'   → filled (flat)
 *   - 'secondary' → outlined
 *   - 'text' | 'outlined' | 'flat' | 'tonal' | 'plain' | 'elevated' → passthrough
 *
 * Defaults suit a filled CTA, but they back off for icon buttons: an icon
 * button with no `color` inherits the ambient text color (not primary) and
 * keeps Vuetify's circular shape (not a forced pill). Anything else — `to`,
 * `href`, `prepend-icon`, `append-icon`, `type`, `aria-label` — falls through
 * to the underlying v-btn via $attrs.
 */
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
    /**
     * Decouples text color from background — Vuetify's `color` sets both. Pass
     * to override (e.g. `color="white" text-color="primary"`). Maps to the
     * `text-<name>` utility class.
     */
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

// Semantic variants map to Vuetify's; raw Vuetify variants pass straight through.
const vuetifyVariant = computed(() => {
  switch (props.variant) {
    case 'primary': return 'flat' as const;
    case 'secondary': return 'outlined' as const;
    default: return props.variant;
  }
});

// Filled buttons default to primary; icon buttons inherit the ambient color
// (most are unstyled and take their parent's text color).
const effectiveColor = computed(
  () => props.color ?? (props.icon ? undefined : 'primary'),
);

// Pill by default; icon buttons keep Vuetify's circular shape.
const effectiveRounded = computed(
  () => props.rounded ?? (props.icon ? undefined : 'pill'),
);

// Pass `icon` to VBtn as a boolean (shape only) — the glyph is rendered via the
// template's slot fallback, since this wrapper's slot suppresses VBtn's own.
const iconShape = computed(() => (props.icon ? true : undefined));

const textColorClass = computed(() =>
  props.textColor ? `text-${props.textColor}` : undefined,
);
</script>

<style scoped lang="scss">
/*
 * Vuetify's v-btn combines `white-space: nowrap`, a fixed `height` and a
 * per-size `min-width`. In a tight row that makes a long label spill out of its
 * pill instead of reflowing. Clipping or ellipsising a label is the worst
 * option — the label IS the affordance — so let it wrap and let the button grow
 * to fit. `min-height` keeps single-line buttons exactly as they are today.
 * Icon buttons opt out: they hold a glyph, not text, and must stay circular.
 */
.v-btn:not(.v-btn--icon) {
  height: auto;
  min-height: var(--v-btn-height);
  padding-top: 6px;
  padding-bottom: 6px;

  :deep(.v-btn__content) {
    white-space: normal;
    text-align: center;
    line-height: 1.25;
  }
}

/*
 * Only the per-size min-width is dropped, and NOT for `block` — a scoped
 * selector here out-specifies Vuetify's `.v-btn--block { min-width: 100% }`,
 * so zeroing it across the board would silently strip `block` of the very
 * guarantee it exists to make.
 */
.v-btn:not(.v-btn--icon):not(.v-btn--block) {
  min-width: 0;
}
</style>
