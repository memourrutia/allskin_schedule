import type { HTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'elevated' | 'outlined' | 'filled' | 'brand'
type Padding  = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  padding?: Padding
  as?:      'div' | 'article' | 'section'
  children: ReactNode
}

const variantStyles: Record<Variant, string> = {
  default:  'bg-neutral-0 border border-neutral-100 shadow-sm',
  elevated: 'bg-neutral-0 border border-neutral-100 shadow-md',
  outlined: 'bg-neutral-0 border border-neutral-200',
  filled:   'bg-neutral-50 border border-neutral-100',
  brand:    'bg-brand-50 border border-brand-100',
}

const paddingStyles: Record<Padding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
}

export function Card({
  variant  = 'default',
  padding  = 'md',
  as:      Tag = 'div',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={[
        'rounded-2xl',
        variantStyles[variant],
        paddingStyles[padding],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}

// ─── Subcomponentes opcionales ────────────────────────────────────────────────

interface CardHeaderProps {
  title:    string
  subtitle?: string
  action?:  ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="text-base font-semibold text-neutral-800 leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardDivider() {
  return <hr className="border-neutral-100 my-4" />
}

interface CardRowProps {
  label: string
  value: ReactNode
  muted?: boolean
}

export function CardRow({ label, value, muted = false }: CardRowProps) {
  return (
    <div
      className={`flex justify-between items-start gap-4 py-2.5 border-b border-neutral-100 last:border-0
        ${muted ? 'opacity-60' : ''}`}
    >
      <span className="text-sm text-neutral-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-neutral-800 text-right">{value}</span>
    </div>
  )
}
