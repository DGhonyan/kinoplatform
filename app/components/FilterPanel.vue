<template>
  <div class="filter-panel">
    <div class="panel-scroll">
      <!-- Two headers, one per breakpoint: static heading on desktop, whole-bar toggle below tablet. -->
      <h2
        :id="titleId"
        class="panel-heading"
      >
        <v-icon>custom:filter</v-icon>
        {{ $t(title) }}
      </h2>

      <button
        type="button"
        class="panel-toggle"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="open = !open"
      >
        <v-icon>custom:filter</v-icon>
        <span class="panel-toggle-title">{{ $t(title) }}</span>
        <v-icon
          class="panel-chevron"
          :class="{ 'is-open': open }"
        >
          mdi-chevron-down
        </v-icon>
      </button>

      <div
        :id="bodyId"
        class="panel-body"
        :class="{ 'is-open': open }"
      >
        <slot />
      </div>
    </div>

    <!-- Pinned outside the scroll area; collapses with the body. -->
    <div
      v-if="hasFooter"
      class="panel-footer"
      :class="{ 'is-open': open }"
    >
      <!-- Full override for a consumer that needs something else entirely. -->
      <slot name="footer">
        <slot name="note" />

        <div class="panel-actions">
          <Button
            v-if="clearable"
            variant="secondary"
            @click="emit('clear')"
          >
            {{ $t('crew_filter_clear_all') }}
          </Button>
          <!-- `type="submit"` submits the consumer's <form>; the click only collapses the panel. Clear deliberately stays open. -->
          <Button
            v-if="showApply"
            type="submit"
            class="panel-apply"
            color="primary"
            :disabled="applyDisabled"
            :loading="applyLoading"
            @click="open = false"
          >
            {{ $t('talent_filter_apply') }}
          </Button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Shared filter sidebar shell (/crew, /talents, /locations). Chrome only —
// facets come via the default slot, actions via #footer (never scrolled).
import Button from '~/components/Button.vue';

const props = withDefaults(
  defineProps<{
    /** i18n key for the panel heading. */
    title?: string;
    /** Show "Clear all" — the consumer decides when any facet is set. */
    clearable?: boolean;
    // Show "Apply". Off by default: a client-side-filtering panel has nothing to submit.
    showApply?: boolean;
    applyDisabled?: boolean;
    applyLoading?: boolean;
  }>(),
  {
    title: 'crew_filters',
    clearable: false,
    showApply: false,
    applyDisabled: false,
    applyLoading: false,
  },
);

const emit = defineEmits<{ clear: [] }>();

const slots = useSlots();
const hasFooter = computed(
  () => !!slots.footer || props.clearable || props.showApply,
);

// Collapsed by default — below tablet the panel sits above the results.
// Desktop ignores this; the CSS only honours it inside the tablet-down block.
const open = ref(false);

const titleId = useId();
const bodyId = useId();
</script>

<style scoped lang="scss">
.filter-panel {
  width: 310px;
  min-width: 310px;
  display: flex;
  flex-direction: column;
  // Sticky and independently scrollable so a long facet list scrolls in the panel.
  position: sticky;
  top: 16px;
  align-self: start;
  // Derived from `top`: 16px above + 16px of breathing room below.
  max-height: calc(100vh - 32px);

  @include tablet-down {
    width: 100%;
    min-width: 0;
    position: static;
    max-height: none;
  }
}

.panel-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;

  @include tablet-down {
    overflow: visible;
    // The page supplies the edge padding once the panel goes full-width.
    padding: 0;
  }
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;

  @include tablet-down {
    display: none;
  }
}

.panel-toggle {
  display: none;

  @include tablet-down {
    display: flex;
    align-items: center;
    gap: 12px;
    // The whole bar is the target, not just the chevron.
    width: 100%;
    min-height: 44px;
    // Vuetify's reset doesn't zero a <button>'s background or border, so
    // without these it renders as a UA `ButtonFace` box under the dark theme.
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font-size: 18px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    outline-offset: -2px;

    &:hover {
      opacity: 0.85;
    }
  }
}

.panel-toggle-title {
  flex: 1;
}

.panel-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 8px;

  @include tablet-down {
    display: none;

    &.is-open {
      display: flex;
    }

    // A rule between stacked facets restores the separation the sidebar gets from whitespace.
    > * + * {
      border-top: 1px solid color(--v-theme-on-surface, 0.24);
    }
  }
}

.panel-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid color(--v-theme-on-surface, 0.14);

  @include tablet-down {
    display: none;
    padding: 12px 0 0;

    &.is-open {
      display: flex;
    }
  }
}

.panel-actions {
  display: flex;
  gap: 8px;

  > * {
    flex: 1;
  }
}
</style>
