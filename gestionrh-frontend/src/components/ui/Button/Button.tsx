import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Si true, affiche un spinner et désactive le bouton
   */
  loading?: boolean;
  /**
   * Icône à afficher à gauche du texte
   */
  leftIcon?: React.ReactNode;
  /**
   * Icône à afficher à droite du texte
   */
  rightIcon?: React.ReactNode;
}

/**
 * Composant Button réutilisable avec variants et états
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Enregistrer
 * </Button>
 * 
 * <Button variant="danger" loading={isDeleting}>
 *   Supprimer
 * </Button>
 * 
 * <Button variant="secondary" leftIcon={<Plus />}>
 *   Ajouter
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={loading || disabled}
        aria-busy={loading}
        aria-disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" data-testid="loading-spinner" aria-hidden="true" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span data-testid="left-icon" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span data-testid="right-icon" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
