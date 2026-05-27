const STEPS = ['Datos', 'Prestación', 'Profesional', 'Horario', 'Confirmar']

interface StepIndicatorProps {
  /** 0 = patient, 1 = service, 2 = professional, 3 = datetime, 4 = confirmation */
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progreso del agendamiento" className="pt-4 pb-1">
      <ol className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const done   = i < currentStep
          const active = i === currentStep

          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              {/* Dot */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    'text-xs font-bold transition-all duration-200',
                    done   ? 'bg-brand-500 text-neutral-0'
                    : active ? 'bg-brand-500 text-neutral-0 ring-4 ring-brand-100'
                    :          'bg-neutral-100 text-neutral-400',
                  ].join(' ')}
                >
                  {done ? (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Label — visible solo en sm+ */}
                <span
                  className={[
                    'hidden sm:block text-[10px] font-medium whitespace-nowrap',
                    active ? 'text-brand-600'
                    : done ? 'text-brand-400'
                    :        'text-neutral-400',
                  ].join(' ')}
                >
                  {label}
                </span>
              </div>

              {/* Línea conectora (no aparece en el último paso) */}
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'flex-1 h-px mx-2 mb-5 sm:mb-4 transition-colors duration-300',
                    done ? 'bg-brand-400' : 'bg-neutral-200',
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
