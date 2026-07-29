<template>
  <div class="search-toolbar">
    <Input
      v-model="model"
      class="search"
      :placeholder="$t(placeholder)"
      prepend-inner-icon="mdi-magnify"
      :maxlength="maxlength"
      bg-color="on-surface"
      color="background"
      text-color="background"
      rounded="pill"
      density="comfortable"
      hide-details
    />
    <!--
      `type="submit"` submits the consumer's surrounding <form> — the pages own
      the form and the submit handler; this bar only renders the controls.
      44 matches the field beside it: comfortable density is tuned to 44px in
      styles/settings.scss ($input-density) — the one sanctioned place the
      density scale can be reshaped without touching Vuetify classes.
    -->
    <Button
      v-if="showButton"
      type="submit"
      class="search-btn"
      color="primary"
      height="44"
      :loading="loading"
      :disabled="disabled"
    >
      {{ $t('common_search') }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
/**
 * The directory search bar shared by /crew (via UserDirectory), /talents and
 * /locations — one pill input plus an optional submit button.
 *
 * Extracted for the same reason as FilterPanel: the identical markup and CSS
 * had been copy-pasted into three files and was already drifting (one copy had
 * no maxlength, one button had lost its icon). Pages keep only their own
 * `grid-area` placement on the wrapper class they pass in.
 *
 * `showButton` is off by default: a directory that filters client-side as you
 * type (crew) has nothing to submit, and a Search button that appears to do
 * nothing is worse than no button.
 */
import Input from '~/components/Input.vue';
import Button from '~/components/Button.vue';

const model = defineModel<string>({ required: true });

withDefaults(
  defineProps<{
    /** i18n key for the input placeholder. */
    placeholder: string;
    showButton?: boolean;
    loading?: boolean;
    disabled?: boolean;
    maxlength?: string | number;
  }>(),
  {
    showButton: false,
    loading: false,
    disabled: false,
    maxlength: undefined,
  },
);
</script>

<style scoped lang="scss">
.search-toolbar {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;

  @include mobile {
    gap: 8px;
  }
}

// Input takes the slack, the Search button stays shrink-to-fit — the pair holds
// one row all the way down to 320px.
.search {
  flex: 1 1 auto;
  min-width: 0;
}

.search-btn {
  flex: 0 0 auto;
}
</style>
