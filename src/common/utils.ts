import type { Ref } from 'vue';

export const validateFields = (fields: Record<string, { model: Ref<string | undefined>, errorMessages?: Ref<string> }>) => {

  let hasErrors = false;

  Object.values(fields).forEach((field) => {

    if (!field.errorMessages) return;

    field.errorMessages.value = '';

    if (!field.model.value) {
      field.errorMessages.value = 'This field is required';
      hasErrors = true;
    }
  });

  return hasErrors;
}
