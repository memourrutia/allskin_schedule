import type { Prestacion } from '../../types/booking'
import { MOCK_PRESTACIONES } from '../../data/mockDentalink'
import { Button } from '../ui/Button'

const ICONOS: Record<string, string> = {
  'evaluacion-allskin':        '✨',
  'continuacion-tratamiento':  '🌿',
}

interface ServiceStepProps {
  selected: Prestacion | null
  onSelect: (prestacion: Prestacion) => void
  onNext:   () => void
  onBack:   () => void
}

export function ServiceStep({ selected, onSelect, onNext, onBack }: ServiceStepProps) {
  const prestaciones = MOCK_PRESTACIONES.filter(p => p.activa)

  return (
    <div className="flex flex-col gap-7">

      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12h.01M12 16h.01"
              stroke="#3A6080" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">¿Qué atención necesitas?</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Selecciona el tipo de tratamiento
          </p>
        </div>
      </div>

      {/* Cards de prestaciones */}
      <div className="flex flex-col gap-2.5">
        {prestaciones.map((prest) => {
          const isSelected = selected?.id === prest.id
          return (
            <button
              key={prest.id}
              onClick={() => onSelect(prest)}
              className={[
                'group flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150',
                isSelected
                  ? 'border-brand-400 bg-brand-50 shadow-sm'
                  : 'border-neutral-100 bg-neutral-0 hover:border-brand-200 hover:bg-neutral-50 hover:shadow-xs',
              ].join(' ')}
            >
              {/* Ícono */}
              <div className={[
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                isSelected ? 'bg-brand-500' : 'bg-neutral-100 group-hover:bg-brand-50',
              ].join(' ')}>
                {isSelected ? (
                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
                    <path d="M1 6l4 4 8-9" stroke="white" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-xl" role="img" aria-label={prest.nombre}>
                    {ICONOS[prest.id] ?? '🦷'}
                  </span>
                )}
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-semibold text-sm ${isSelected ? 'text-brand-700' : 'text-neutral-800'}`}>
                    {prest.nombre}
                  </p>
                  <span className={`text-xs font-medium shrink-0 px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-brand-100 text-brand-600' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {prest.duracion_minutos} min
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  {prest.descripcion}
                </p>
              </div>

            </button>
          )
        })}
      </div>

      {/* Ayuda contextual */}
      {!selected && (
        <p className="text-xs text-neutral-400 flex items-center gap-1.5">
          <span>💡</span>
          Si es tu primera vez en AllSKIN, elige <strong className="font-medium">Evaluación AllSKIN</strong>.
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-1 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Volver</Button>
        <Button fullWidth disabled={!selected} onClick={onNext}>Continuar →</Button>
      </div>

    </div>
  )
}
