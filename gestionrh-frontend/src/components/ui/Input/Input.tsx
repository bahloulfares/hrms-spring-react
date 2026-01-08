import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle } from 'lucide-react';

const inputVariants = cva(
  'w-full rounded-xl border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-gray-200 focus:ring-blue-500 focus:border-transparent',
        error: 'border-red-300 focus:ring-red-500 bg-red-50',
        success: 'border-green-300 focus:ring-green-500 bg-green-50',
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Label du champ
   */
  label?: string;
  /**
   * Message d'erreur à afficher
   */
  error?: string;
  /**
   * Message d'aide
   */
  helperText?: string;
  /**
   * Icône à afficher à gauche
   */
  leftIcon?: React.ReactNode;
  /**
   * Icône à afficher à droite
   */
  rightIcon?: React.ReactNode;
  /**
   * Conteneur wrapper className
   */
  wrapperClassName?: string;
}

/**
 * Composant Input réutilisable avec validation et icons
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email" 
 *   type="email"
 *   placeholder="exemple@email.com"
 *   error={errors.email?.message}
 * />
 * 
 * <Input 
 *   label="Rechercher"
 *   leftIcon={<Search />}
 *   placeholder="Rechercher..."
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      wrapperClassName,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputVariants({
              variant: finalVariant,
              size,
              className: [
                className,
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
              ].filter(Boolean).join(' '),
            })}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            required={required}
            {...props}
          />

          {rightIcon && !hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}

          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !hasError && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
