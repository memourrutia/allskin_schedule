import { Button } from '../ui/Button'

interface WelcomeStepProps {
  onStart: () => void
}

function TrustSignal({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-neutral-500">
      <span className="text-base">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  )
}

function HeroPill({ text, offset }: { text: string; offset: string }) {
  return (
    <div className={`absolute ${offset} bg-neutral-0 border border-brand-100 rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-2 whitespace-nowrap`}>
      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
      <span className="text-xs font-semibold text-brand-700">{text}</span>
    </div>
  )
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">

      <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16 py-12 lg:py-20">

        {/* ── Columna texto ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 self-start">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
              Allskin · Alpes — Providencia
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-neutral-800 leading-[1.1] tracking-tight">
              Agenda tu hora
              <br />
              <span className="text-brand-500">en minutos.</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-500 leading-relaxed mt-4 max-w-sm">
              Reserva tu evaluación o sesión de tratamiento estético facial en{' '}
              <strong className="text-neutral-700 font-semibold">Allskin-Alpes</strong>.
              Sin llamadas, sin esperas.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button size="lg" onClick={onStart} rightIcon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }>
              Comenzar agendamiento
            </Button>
            <span className="text-xs text-neutral-400">Solo toma 2 minutos</span>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-neutral-100">
            <TrustSignal icon="📍" text="Providencia, Santiago" />
            <TrustSignal icon="🗓" text="Lun – Vie · 09:00 – 18:00" />
            <TrustSignal icon="🔒" text="Tus datos son seguros" />
          </div>
        </div>

        {/* ── Columna decorativa (solo desktop) ────────────────── */}
        <div className="hidden lg:flex items-center justify-center w-[340px] xl:w-[400px] shrink-0">
          <div className="relative w-full aspect-square">

            {/* Anillos concéntricos */}
            <div className="absolute inset-0 rounded-full bg-brand-50 opacity-60" />
            <div className="absolute inset-8 rounded-full bg-brand-50" />

            {/* Círculo interior con ícono de estética */}
            <div className="absolute inset-16 rounded-full bg-brand-100 flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                {/* Cara estilizada */}
                <ellipse cx="32" cy="30" rx="18" ry="20" fill="#EEF2F6" stroke="#3A6080" strokeWidth="2"/>
                {/* Ojos */}
                <ellipse cx="25" cy="27" rx="2.5" ry="3" fill="#3A6080"/>
                <ellipse cx="39" cy="27" rx="2.5" ry="3" fill="#3A6080"/>
                {/* Sonrisa */}
                <path d="M26 37 Q32 42 38 37" stroke="#3A6080" strokeWidth="2" strokeLinecap="round" fill="none"/>
                {/* Destellos */}
                <path d="M52 12 L54 8 L56 12 L54 16 Z" fill="#F4A820" opacity="0.8"/>
                <path d="M10 18 L11.5 15 L13 18 L11.5 21 Z" fill="#F4A820" opacity="0.6"/>
                <circle cx="52" cy="42" r="2" fill="#F4A820" opacity="0.7"/>
              </svg>
            </div>

            {/* Pills flotantes con los servicios reales */}
            <HeroPill text="Evaluación AllSKIN"        offset="top-6 right-0" />
            <HeroPill text="Continuación de tratamiento" offset="bottom-6 left-2" />
            <HeroPill text="Estética facial"            offset="top-1/2 -left-6 -translate-y-1/2" />

          </div>
        </div>

      </div>

      {/* Separador */}
      <div className="border-t border-neutral-100 pb-6" />

    </div>
  )
}
