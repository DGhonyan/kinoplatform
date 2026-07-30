<template>
  <div
    class="filter-section"
    :class="{ 'is-open': open }"
  >
    <!-- Two headers, one per breakpoint (CSS picks; the hidden one is
         display:none, so it leaves the a11y tree and the tab order):
         a plain heading on desktop where the sidebar is always open, and a
         real disclosure button below tablet where the panel stacks. -->
    <h3 class="section-heading">
      {{ $t(title) }}
    </h3>

    <button
      type="button"
      class="section-toggle"
      :aria-expanded="open"
      :aria-controls="bodyId"
      @click="open = !open"
    >
      <span>{{ $t(title) }}</span>
      <v-icon
        size="20"
        class="section-chevron"
      >
        mdi-chevron-down
      </v-icon>
    </button>

    <div
      :id="bodyId"
      class="section-body"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
// One collapsible facet. The header is the facet's ONLY visible name — give the
// slotted control an `aria-label`, not a visible label, or it renders twice.
withDefaults(
  defineProps<{
    /** i18n key for the facet name. */
    title: string;
  }>(),
  {},
);

const open = ref(false);

// Per-instance id so aria-controls stays unique across the 11 sections on
// /talents.
const bodyId = useId();
</script>

<style scoped lang="scss">
.filter-section {
  display: flex;
  flex-direction: column;
}

.section-heading {
  margin: 0;
  padding: 4px 0;
  font-size: 15px;
  font-weight: 600;
}

.section-toggle {
  display: none;
}

.section-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;

  .is-open & {
    transform: rotate(180deg);
  }
}

// Below tablet the panel stacks above the results, so each facet folds away.
@include tablet-down {
  .section-heading {
    display: none;
  }

  .section-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    // Vuetify's reset doesn't zero a <button>'s background or border, so without
    // these the header renders as a UA grey box under near-white dark-theme text.
    background: none;
    border: none;
    padding: 10px 0;
    color: inherit;
    font-size: 15px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    // Panels are scroll containers, which clip an outset focus ring.
    outline-offset: -2px;

    &:hover {
      opacity: 0.85;
    }
  }

  .section-body {
    display: none;
    padding-bottom: 12px;

    .is-open & {
      display: block;
    }
  }
}
</style>
