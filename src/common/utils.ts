import type { Ref } from 'vue';

export const validateFields = (fields: Record<string, { model: Ref<string | undefined>, errorMessages?: Ref<string> }>, t: (key: string) => string) => {
  let hasErrors = false;

  Object.values(fields).forEach((field) => {

    if (!field.errorMessages) return;

    field.errorMessages.value = '';

    if (!field.model.value) {
      field.errorMessages.value = t('common_this_field_is_required');
      hasErrors = true;
    }
  });

  return hasErrors;
}
