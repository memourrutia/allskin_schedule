import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string
  hint?:      string
  error?:     string
  success?:   boolean
  required?:  boolean
  leftAddon?: ReactNode
  rightAddon?: ReactNode
}

export function Input({
  label,
  hint,
  error,
  success,
  required,
  leftAddon,
  rightAddon,
  id,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? 'input'

  const borderClass = error
    ? 'border-error-base ring-1 ring-error-base bg-error-bg'
    : success
    ? 'border-success-base ring-1 ring-success-base'
    : 'border-neutral-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400'

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-error-base text-xs">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3.5 text-neutral-400 shrink-0 pointer-events-none">
            {leftAddon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error   ? `${inputId}-error`  :
            hint    ? `${inputId}-hint`   : undefined
          }
          className={[
            'w-full rounded-lg border bg-neutral-0 text-neutral-900',
            'px-4 py-2.5 text-sm placeholder:text-neutral-400',
            'transition-all duration-150',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100',
            leftAddon  ? 'pl-10' : '',
            rightAddon ? 'pr-10' : '',
            borderClass,
            className,
          ].join(' ')}
          {...props}
        />

        {rightAddon && (
          <span className="absolute right-3.5 text-neutral-400 shrink-0 pointer-events-none">
            {rightAddon}
          </span>
        )}

        {/* Icono de estado inline */}
        {(error || success) && !rightAddon && (
          <span
            className={`absolute right-3.5 text-sm pointer-events-none
              ${error ? 'text-error-base' : 'text-success-base'}`}
          >
            {error ? '⚠' : '✓'}
          </span>
        )}
      </div>

      {/* Mensajes de apoyo */}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error-text flex items-center gap-1">
          <span>●</span> {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  )
}
