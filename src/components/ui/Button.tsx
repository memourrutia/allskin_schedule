import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  fullWidth?: boolean
  leftIcon?:  ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary: [
    'bg-brand-500 text-neutral-0',
    'hover:bg-brand-600 active:bg-brand-700',
    'focus-visible:ring-brand-400',
    'shadow-sm hover:shadow-brand disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-brand-50 text-brand-700 border border-brand-200',
    'hover:bg-brand-100 active:bg-brand-200',
    'focus-visible:ring-brand-300',
  ].join(' '),

  outline: [
    'bg-neutral-0 text-neutral-800 border border-neutral-200',
    'hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100',
    'focus-visible:ring-neutral-400',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-600',
    'hover:bg-neutral-100 hover:text-neutral-800 active:bg-neutral-200',
    'focus-visible:ring-neutral-300',
  ].join(' '),

  danger: [
    'bg-error-base text-neutral-0',
    'hover:bg-red-700 active:bg-red-800',
    'focus-visible:ring-error-base',
    'shadow-sm',
  ].join(' '),
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8  px-3.5 text-sm   gap-1.5 rounded-md',
  md: 'h-11 px-5   text-sm   gap-2   rounded-lg',
  lg: 'h-13 px-6   text-base gap-2   rounded-xl',
}

export function Button({
  variant   = 'primary',
  size      = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
