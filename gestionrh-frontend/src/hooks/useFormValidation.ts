/**
 * useFormValidation - Hook personnalisé pour react-hook-form + Zod
 * 
 * Simplifie l'utilisation de react-hook-form avec validation Zod
 * Gère les erreurs de manière cohérente
 */

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn, FieldValues, SubmitHandler, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import toast from 'react-hot-toast';

interface UseFormValidationOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ZodType<T>;
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
}

/**
 * Hook pour gérer les formulaires avec validation Zod
 * 
 * @example
 * const form = useFormValidation({
 *   schema: CreateEmployeeSchema,
 *   defaultValues: { nom: '', email: '' },
 *   onSuccess: (data) => console.log('Validé!', data),
 * });
 * 
 * const { register, handleSubmit, formState: { errors } } = form;
 */
export function useFormValidation<T extends FieldValues>(
  options: UseFormValidationOptions<T>
) {
  const {
    schema,
    onSuccess,
    onError,
    showSuccessToast = true,
    successMessage = 'Opération réussie!',
    ...formProps
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<T>({
    ...formProps,
    resolver: zodResolver(schema as any),
    mode: 'onBlur', // Valider au blur pour meilleure UX
  });

  const handleError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error
        ? error.message
        : 'Une erreur s\'est produite';
      
      console.error('[Form Error]', error);
      toast.error(message);
      onError?.(error instanceof Error ? error : new Error(message));
    },
    [onError]
  );

  const handleSuccess: SubmitHandler<T> = useCallback(
    async (data: T) => {
      try {
        await onSuccess?.(data);
        if (showSuccessToast) {
          toast.success(successMessage);
        }
      } catch (error) {
        handleError(error);
      }
    },
    [onSuccess, showSuccessToast, successMessage, handleError]
  );

  return {
    ...form,
    isSubmitting: form.formState.isSubmitting,
    formError: form.formState.errors.root?.message as string | null || null,
    handleSubmit: (onInvalid?: (errors: unknown) => void) => 
      form.handleSubmit(handleSuccess, onInvalid || ((errors) => {
        // Afficher les erreurs pour debugging
        if (Object.keys(errors).length > 0) {
          console.warn('[Form Validation Errors]', errors);
        }
      })),
  };
}

/**
 * Hook pour gérer les erreurs de formulaire côté serveur
 * 
 * @example
 * const { setServerErrors } = useServerErrors(form);
 * 
 * try {
 *   await submitForm();
 * } catch (error) {
 *   if (error.response?.status === 422) {
 *     setServerErrors(error.response.data.errors);
 *   }
 * }
 */
export function useServerErrors<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const setServerErrors = useCallback(
    (errors: Record<string, string | string[]>) => {
      Object.entries(errors).forEach(([field, message]) => {
        const msg = Array.isArray(message) ? message[0] : message;
        form.setError(field as Path<T>, {
          type: 'server',
          message: msg,
        });
      });
    },
    [form]
  );

  return { setServerErrors };
}
