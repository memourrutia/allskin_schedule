import { useState, useEffect, useMemo } from 'react'
import type { Profesional, Slot } from '../../types/booking'
import { dentalinkService } from '../../services/dentalink'
import { Button } from '../ui/Button'

interface DateTimeStepProps {
  profesional: Profesional
  selected:    Slot | null
  onSelect:    (slot: Slot) => void
  onNext:      () => void
  onBack:      () => void
}

const DIAS_ES  = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function parseFecha(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return { dia: DIAS_ES[d.getDay()], num: d.getDate(), mes: MESES_ES[d.getMonth()] }
}

function agruparPorFranja(slots: Slot[]) {
  return {
    manana: slots.filter(s => parseInt(s.hora_inicio.split(':')[0]) < 13),
    tarde:  slots.filter(s => parseInt(s.hora_inicio.split(':')[0]) >= 13),
  }
}

function GrillaHoras({ slots, selected, onSelect }: {
  slots:    Slot[]
  selected: Slot | null
  onSelect: (slot: Slot) => void
}) {
  if (!slots.length) return null
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map(slot => {
        const isSelected = selected?.id === slot.id
        return (
          <button
            key={slot.id}
            onClick={() => onSelect(slot)}
            aria-pressed={isSelected}
            className={[
              'py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
              isSelected
                ? 'bg-brand-500 text-neutral-0 shadow-brand'
                : 'bg-neutral-0 border border-neutral-200 text-neutral-700 hover:border-brand-400 hover:text-brand-600 hover:shadow-xs',
            ].join(' ')}
          >
            {slot.hora_inicio}
          </button>
        )
      })}
    </div>
  )
}

export function DateTimeStep({ profesional, selected, onSelect, onNext, onBack }: DateTimeStepProps) {
  const [fechas, setFechas]           = useState<string[]>([])
  const [fechaActiva, setFechaActiva] = useState<string>(selected?.fecha ?? '')
  const [slots, setSlots]             = useState<Slot[]>([])
  const [loadingFechas, setLoadingFechas] = useState(true)
  const [loadingSlots, setLoadingSlots]   = useState(false)
  const [errorSlots, setErrorSlots]       = useState<string | null>(null)

  // Cargar fechas disponibles al montar
  useEffect(() => {
    setLoadingFechas(true)
    dentalinkService.getFechasDisponibles(profesional.id)
      .then(f => {
        setFechas(f)
        if (!fechaActiva && f.length > 0) setFechaActiva(f[0])
      })
      .finally(() => setLoadingFechas(false))
  }, [profesional.id])

  // Cargar slots cuando cambia la fecha activa
  useEffect(() => {
    if (!fechaActiva) return
    setLoadingSlots(true)
    setErrorSlots(null)
    setSlots([])
    dentalinkService.getSlots(profesional.id, fechaActiva)
      .then(setSlots)
      .catch(() => setErrorSlots('No se pudo cargar la disponibilidad para esta fecha.'))
      .finally(() => setLoadingSlots(false))
  }, [profesional.id, fechaActiva])

  const { manana, tarde } = useMemo(() => agruparPorFranja(slots), [slots])
  const canContinue = selected != null && selected.fecha === fechaActiva

  const handleFecha = (fecha: string) => {
    setFechaActiva(fecha)
    // Limpiar slot si era de otra fecha
    if (selected?.fecha !== fecha) {
      onSelect({ ...selected!, id: '', estado: 'bloqueado' })
    }
  }

  return (
    <div className="flex flex-col gap-7">

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="#3A6080" strokeWidth="1.8"/>
            <path d="M8 2v4M16 2v4M3 10h18" stroke="#3A6080" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="8"  cy="15" r="1.2" fill="#3A6080"/>
            <circle cx="12" cy="15" r="1.2" fill="#3A6080"/>
            <circle cx="16" cy="15" r="1.2" fill="#3A6080"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Fecha y hora</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Horarios de <span className="font-semibold text-neutral-700">{profesional.nombre_display}</span>
          </p>
        </div>
      </div>

      {/* Selector de fechas */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Próximos días disponibles
        </p>
        {loadingFechas ? (
          <div className="flex items-center gap-2 py-4">
            <div className="w-4 h-4 rounded-full border-2 border-brand-100 border-t-brand-500 animate-spin" />
            <p className="text-sm text-neutral-400">Cargando fechas…</p>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {fechas.slice(0, 7).map(fecha => {
              const { dia, num, mes } = parseFecha(fecha)
              const isActive = fecha === fechaActiva
              return (
                <button
                  key={fecha}
                  onClick={() => handleFecha(fecha)}
                  aria-pressed={isActive}
                  className={[
                    'flex flex-col items-center px-3 py-2.5 rounded-2xl min-w-[60px] border transition-all duration-150 shrink-0',
                    isActive
                      ? 'bg-brand-500 border-brand-500 text-neutral-0 shadow-brand'
                      : 'bg-neutral-0 border-neutral-200 text-neutral-700 hover:border-brand-300 hover:shadow-xs',
                  ].join(' ')}
                >
                  <span className="text-[10px] font-bold uppercase">{dia}</span>
                  <span className="text-2xl font-black leading-tight">{num}</span>
                  <span className="text-[10px] font-medium">{mes}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Slots */}
      {fechaActiva && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Horarios disponibles
          </p>

          {loadingSlots && (
            <div className="flex items-center gap-2 py-4">
              <div className="w-4 h-4 rounded-full border-2 border-brand-100 border-t-brand-500 animate-spin" />
              <p className="text-sm text-neutral-400">Consultando disponibilidad…</p>
            </div>
          )}

          {errorSlots && (
            <p className="text-sm text-error-text">{errorSlots}</p>
          )}

          {!loadingSlots && !errorSlots && slots.length === 0 && (
            <p className="text-sm text-neutral-400 py-3">
              Sin horarios disponibles para este día. Prueba con otra fecha.
            </p>
          )}

          {!loadingSlots && !errorSlots && slots.length > 0 && (
            <div className="flex flex-col gap-4">
              {manana.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
                    <span>🌅</span> Mañana
                  </p>
                  <GrillaHoras slots={manana} selected={selected} onSelect={onSelect} />
                </div>
              )}
              {tarde.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
                    <span>🌤</span> Tarde
                  </p>
                  <GrillaHoras slots={tarde} selected={selected} onSelect={onSelect} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-1 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Volver</Button>
        <Button fullWidth disabled={!canContinue} onClick={onNext}>Continuar →</Button>
      </div>
    </div>
  )
}
