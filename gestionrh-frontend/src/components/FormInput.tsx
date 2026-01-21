/**
 * FormInput - Input réutilisable avec intégration react-hook-form
 * 
 * Gère automatiquement:
 * - Affichage des erreurs
 * - States (focus, disabled, etc)
 * - Validation visuelle
 */

import type { InputHTMLAttributes, ReactNode } from 'react';
import type { FieldValues, Path, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

interface FormInputProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label?: string;
  name: Path<T>;
  registration: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  required?: boolean;
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  registration,
  error,
  hint,
  icon,
  required,
  className,
  disabled,
  ...props
}: FormInputProps<T>) {
  const hasError = !!error;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          {...registration}
          {...props}
          id={name}
          disabled={disabled}
          className={`
            w-full px-3 py-2 rounded-lg border transition-all duration-200
            text-slate-900 placeholder-slate-400
            focus:outline-none focus:ring-2
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${icon ? 'pl-9' : ''}
            ${
              hasError
                ? 'border-red-300 focus:ring-red-200 bg-red-50'
                : 'border-slate-300 focus:ring-blue-200 focus:border-blue-400'
            }
            ${className || ''}
          `}
        />

        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export default FormInput;
