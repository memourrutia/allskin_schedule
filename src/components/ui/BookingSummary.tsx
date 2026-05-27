import type { BookingFormData } from '../../types/booking'
import type { BookingStep } from '../../hooks/useBooking'
import { MOCK_SUCURSAL } from '../../data/mockDentalink'

interface BookingSummaryProps {
  data: BookingFormData
  step: BookingStep
}

const DIAS  = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fechaCorta(fecha: string, hora: string): string {
  const d = new Date(fecha + 'T12:00:00')
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} · ${hora} h`
}

// ─── Item individual del resumen ─────────────────────────────────────────────

interface ItemProps {
  label:      string
  value?:     string
  secondary?: string
  done:       boolean
}

function Item({ label, value, secondary, done }: ItemProps) {
  return (
    <div className="flex gap-3 min-w-0">
      {/* Dot / checkmark */}
      <div className={[
        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors',
        done ? 'bg-brand-500' : 'bg-neutral-100',
      ].join(' ')}>
        {done ? (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
            <path d="M1 3.5L3.5 6 8 1" stroke="white" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold uppercase tracking-wider ${done ? 'text-neutral-500' : 'text-neutral-300'}`}>
          {label}
        </p>
        {done && value ? (
          <>
            <p className="text-sm font-semibold text-neutral-800 mt-0.5 truncate">{value}</p>
            {secondary && <p className="text-xs text-neutral-400 truncate">{secondary}</p>}
          </>
        ) : (
          <p className="text-xs text-neutral-300 mt-0.5">Pendiente</p>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function BookingSummary({ data, step }: BookingSummaryProps) {
  const { paciente, prestacion, profesional, slot } = data

  // No mostrar el resumen en bienvenida ni en éxito
  if (step === 'welcome' || step === 'success') return null

  return (
    <aside aria-label="Resumen de reserva">
      <div className="bg-neutral-0 rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

        {/* Cabecera */}
        <div className="px-5 py-4 bg-brand-500 flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm font-semibold text-neutral-0">Tu resumen</p>
        </div>

        {/* Items */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Sucursal — siempre visible */}
          <Item
            label="Sucursal"
            value={MOCK_SUCURSAL.nombre}
            secondary={`${MOCK_SUCURSAL.comuna}, ${MOCK_SUCURSAL.ciudad}`}
            done={true}
          />

          {/* Prestación */}
          <Item
            label="Prestación"
            value={prestacion?.nombre}
            secondary={prestacion ? `⏱ ${prestacion.duracion_minutos} min` : undefined}
            done={!!prestacion}
          />

          {/* Profesional */}
          <Item
            label="Profesional"
            value={profesional?.nombre_display}
            secondary={profesional?.especialidad}
            done={!!profesional}
          />

          {/* Fecha y hora */}
          <Item
            label="Fecha y hora"
            value={slot ? fechaCorta(slot.fecha, slot.hora_inicio) : undefined}
            done={!!slot && slot.estado === 'disponible'}
          />

          {/* Paciente — solo si ya ingresó sus datos */}
          {paciente && (
            <Item
              label="Paciente"
              value={`${paciente.nombre} ${paciente.apellido}`}
              secondary={paciente.email}
              done={true}
            />
          )}
        </div>

        {/* Footer con contacto */}
        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 leading-relaxed">
            ¿Necesitas ayuda?{' '}
            <a href={`tel:${MOCK_SUCURSAL.telefono.replace(/\s/g, '')}`}
              className="text-brand-600 hover:text-brand-700 font-semibold hover:underline transition-colors">
              {MOCK_SUCURSAL.telefono}
            </a>
          </p>
        </div>

      </div>
    </aside>
  )
}
