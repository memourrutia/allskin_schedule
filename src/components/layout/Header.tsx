import type { ReactNode } from 'react'
import logoAlpesDental from '../../assets/logo-alpes-dental.png'

interface HeaderProps {
  children?: ReactNode  // slot para StepIndicator u otro contenido debajo del nav
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-[200] bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Nav principal */}
        <div className="flex items-center justify-between h-16">

          {/* Logo imagen */}
          <img
            src={logoAlpesDental}
            alt="Alpes Dental — La ciencia de tu sonrisa"
            className="h-9 w-auto object-contain"
            draggable={false}
          />

          {/* Badge de estado */}
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full whitespace-nowrap">
            Agenda online
          </span>
        </div>

        {/* Slot para StepIndicator */}
        {children && (
          <div className="pb-1">
            {children}
          </div>
        )}

      </div>
    </header>
  )
}
