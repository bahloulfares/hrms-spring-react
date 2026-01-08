import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const textareaVariants = cva(
  'w-full rounded-xl border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none',
  {
    variants: {
      variant: {
        default: 'border-gray-200 focus:ring-blue-500 focus:border-transparent',
        error: 'border-red-300 focus:ring-red-500 bg-red-50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      wrapperClassName,
      id,
      required,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaVariants({ variant: finalVariant, size, className })}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          required={required}
          {...props}
        />

        {hasError && (
          <p
            id={`${textareaId}-error`}
            className="mt-1.5 text-xs text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !hasError && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
