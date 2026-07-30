import type { Ref } from 'vue';
import type { ApiError } from '~/utils/api';
import { apiErrorMessageKey } from '~/utils/apiErrors';

// Popup form scaffolding: reactive form + errors, busy flag, auto-reset on
// close, and applyError (routes an API error inline, else shows a snackbar).
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
