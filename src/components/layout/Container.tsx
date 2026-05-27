import type { HTMLAttributes, ReactNode } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** max-w del contenedor — 'booking' = max-lg para el flujo de agendamiento */
  size?:    'booking' | 'narrow' | 'wide' | 'full'
}

const sizeStyles = {
  booking: 'max-w-lg',   // 512px — ancho ideal para flujo mobile-first
  narrow:  'max-w-md',   // 448px
  wide:    'max-w-2xl',  // 672px
  full:    'max-w-full',
}

export function Container({
  children,
  size      = 'booking',
  className = '',
  ...props
}: ContainerProps) {
  return (
    <div
      className={[
        'mx-auto w-full min-h-screen flex flex-col',
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

/** Área de contenido principal — aplica padding horizontal y padding top/bottom */
interface MainProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

export function Main({ children, className = '', ...props }: MainProps) {
  return (
    <main
      className={['flex-1 px-5 py-6', className].join(' ')}
      {...props}
    >
      {children}
    </main>
  )
}
