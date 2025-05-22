// hooks/useForm.ts
import { useState } from 'react';

type FormValues = { [key: string]: string };

export const useForm = (initialForm: FormValues) => {
  const [formValues, setFormState] = useState<FormValues>(initialForm);

  const onInputChange = (name: string, value: string) => {
    setFormState({
      ...formValues,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormState(initialForm);
  };

  return {
    formValues,
    onInputChange,
    resetForm,
  };
};
