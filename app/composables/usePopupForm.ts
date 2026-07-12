import type { Ref } from 'vue';
import type { ApiError } from '~/utils/api';
import { apiErrorMessageKey } from '~/utils/apiErrors';

/**
 * Shared scaffolding for the settings dialogs: a reactive `form` + `errors`, a
 * `busy` flag, auto-reset when the popup closes, and `applyError` — which routes
 * an API error to an inline field (via a code→field map, or a `fallbackField`
 * for flows where every error is inline) and otherwise shows a snackbar. Each
 * popup passes factories so it keeps its own field shape; `onReset` covers any
 * extra state (e.g. a wizard step).
 */
export function usePopupForm<F extends object, E extends object>(
  open: Ref<boolean>,
  makeForm: () => F,
  makeErrors: () => E,
  onReset?: () => void,
) {
  const { t } = useI18n();
  const appStore = useAppStore();

  const form = reactive(makeForm());
  const errors = reactive(makeErrors());
  const busy = ref(false);

  const reset = () => {
    Object.assign(form, makeForm());
    Object.assign(errors, makeErrors());
    busy.value = false;
    onReset?.();
  };

  // Re-opening a closed popup should never show stale input.
  watch(open, (isOpen) => {
    if (!isOpen) reset();
  });

  const applyError = (
    error: ApiError,
    fieldMap: Record<string, string> = {},
    fallbackField?: string,
  ) => {
    const key = apiErrorMessageKey(error);
    const field = (error.code ? fieldMap[error.code] : undefined) ?? fallbackField;

    if (field) (errors as Record<string, string>)[field] = t(key);
    else appStore.showMessage(key, 'error');
  };

  return { form, errors, busy, reset, applyError };
}
