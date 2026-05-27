import { useState, useEffect } from 'react'
import type { Prestacion, Profesional } from '../../types/booking'
import { dentalinkService } from '../../services/dentalink'
import { Button } from '../ui/Button'

interface ProfessionalStepProps {
  prestacion: Prestacion
  selected:   Profesional | null
  onSelect:   (p: Profesional) => void
  onNext:     () => void
  onBack:     () => void
}

const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-sky-100 text-sky-700',
  'bg-neutral-100 text-neutral-600',
]

export function ProfessionalStep({
  prestacion, selected, onSelect, onNext, onBack,
}: ProfessionalStepProps) {
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    dentalinkService.getProfesionalesByPrestacion(prestacion.id)
      .then(setProfesionales)
      .catch(() => setError('No se pudieron cargar los profesionales. Intenta de nuevo.'))
      .finally(() => setLoading(false))
  }, [prestacion.id])

  return (
    <div className="flex flex-col gap-7">

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="7" r="3" stroke="#3A6080" strokeWidth="1.8"/>
            <circle cx="6"  cy="17" r="2" stroke="#3A6080" strokeWidth="1.8"/>
            <circle cx="18" cy="17" r="2" stroke="#3A6080" strokeWidth="1.8"/>
            <path d="M9 15c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="#3A6080" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Elige un profesional</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Para: <span className="font-semibold text-neutral-700">{prestacion.nombre}</span>
          </p>
        </div>
      </div>

      {/* Estados de carga */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-10">
          <div className="w-5 h-5 rounded-full border-2 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-neutral-500">Cargando profesionales…</p>
        </div>
      )}

      {error && (
        <div className="bg-error-bg border border-error-border rounded-xl px-4 py-3">
          <p className="text-sm text-error-text">{error}</p>
        </div>
      )}

      {!loading && !error && profesionales.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-4xl mb-3">🤷</p>
          <p className="text-sm">No hay profesionales disponibles para esta prestación.</p>
        </div>
      )}

      {!loading && !error && profesionales.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {profesionales.map((pro, idx) => {
            const isSelected = selected?.id === pro.id
            const avatarColor = isSelected
              ? 'bg-brand-500 text-neutral-0'
              : AVATAR_COLORS[idx % AVATAR_COLORS.length]

            return (
              <button
                key={pro.id}
                onClick={() => onSelect(pro)}
                className={[
                  'group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150',
                  isSelected
                    ? 'border-brand-400 bg-brand-50 shadow-sm'
                    : 'border-neutral-100 bg-neutral-0 hover:border-brand-200 hover:bg-neutral-50 hover:shadow-xs',
                ].join(' ')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${avatarColor}`}>
                  {isSelected ? (
                    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
                      <path d="M1 6l4 4 8-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : pro.iniciales}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isSelected ? 'text-brand-700' : 'text-neutral-800'}`}>
                    {pro.nombre_display}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{pro.especialidad}</p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                      <path d="M1 3.5L3.5 6 8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-3 pt-1 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Volver</Button>
        <Button fullWidth disabled={!selected || loading} onClick={onNext}>Continuar →</Button>
      </div>
    </div>
  )
}
