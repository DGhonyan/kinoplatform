<template>
  <div class="filter-panel">
    <div class="panel-scroll">
      <!--
        Two headers, one per breakpoint. Above tablet the panel is a permanently
        open sidebar, so the heading is just a heading and no toggle exists in
        the DOM at all (display:none keeps it out of the tab order and the a11y
        tree — an inert-but-focusable control would be worse than none).
        Below tablet the ENTIRE bar is the button: a 24px chevron is a poor
        target next to a label that reads like it should be tappable.
      -->
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

    <!-- Pinned so the primary action stays reachable without scrolling the
         facets. Collapses with the body: offering Apply under a folded panel
         invites submitting filters you can't see. -->
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
          <!--
            `type="submit"` submits the consumer's surrounding <form>; the click
            handler only collapses the panel. That matters below tablet, where
            the panel sits ABOVE the results — leaving it open buries the very
            results you just asked for behind the whole facet list. Desktop
            ignores `open` entirely, so the same line is correct on both.
            Clear deliberately does NOT close: you're usually mid-adjustment.
          -->
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
/**
 * The filter sidebar shell shared by every directory (/crew via UserDirectory,
 * /talents, /locations): sticky scrollable column on desktop, full-width
 * collapsible block below tablet.
 *
 * It owns the chrome only — the facets themselves come through the default slot
 * as `<FilterSection>`s, and the actions through `#footer`. This exists because
 * the same ~135 lines of markup and SCSS had been copy-pasted into three files
 * and had already drifted apart (three different `max-height` values), so a fix
 * to the collapse behaviour or the aria wiring had to be made and re-tested
 * three times.
 *
 * The footer is deliberately NOT part of the scroll area.
 */
import Button from '~/components/Button.vue';

const props = withDefaults(
  defineProps<{
    /** i18n key for the panel heading. */
    title?: string;
    /** Show "Clear all" — the consumer decides when any facet is set. */
    clearable?: boolean;
    /**
     * Show "Apply". Off by default: a panel that filters client-side as you
     * type (see UserDirectory) has nothing to submit, and a button that appears
     * to do nothing is worse than no button.
     */
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

// Collapsed by default: below tablet the panel sits above the results, so an
// open one would push them off-screen. Desktop ignores this entirely — the CSS
// only honours it inside the tablet-down block.
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
  // Sticky and independently scrollable, so a long facet list scrolls IN the
  // panel rather than growing the page.
  position: sticky;
  top: 16px;
  align-self: start;
  // Derived from `top`, not from a guessed header height: 16px above + 16px of
  // breathing room below. The three copies this replaces used 330px, 330px and
  // 120px — magic numbers nobody could reconcile.
  max-height: calc(100vh - 32px);

  @include tablet-down {
    // Full-width block in the page flow: nothing to stick to, and no reason to
    // cap the height once it no longer competes with the results column.
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
    // The page supplies the edge padding once the panel goes full-width, so the
    // facets line up with the toolbar and the results.
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

    // Stacked, the facets read as one undifferentiated list; a rule between
    // them restores the separation the sidebar gets from its own whitespace.
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
