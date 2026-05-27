import type { BookingFormData } from '../../types/booking'
import { Button } from '../ui/Button'

interface ConfirmationStepProps {
  data:         BookingFormData
  onConfirm:    () => void
  onBack:       () => void
  confirming?:  boolean
  errorConfirm?: string | null
}

const DIAS_ES  = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function fechaLarga(fecha: string, hora: string): string {
  const d = new Date(fecha + 'T12:00:00')
  return `${DIAS_ES[d.getDay()]} ${d.getDate()} de ${MESES_ES[d.getMonth()]} · ${hora} h`
}

interface SectionProps {
  title:    string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 mb-2">
        {title}
      </p>
      <div className="flex flex-col gap-0">
        {children}
      </div>
    </div>
  )
}

interface RowProps {
  label: string
  value: string
  accent?: boolean
}

function Row({ label, value, accent = false }: RowProps) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-neutral-100 last:border-0">
      <span className="text-sm text-neutral-500 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-right ${accent ? 'text-brand-700' : 'text-neutral-800'}`}>
        {value}
      </span>
    </div>
  )
}

export function ConfirmationStep({ data, onConfirm, onBack, confirming, errorConfirm }: ConfirmationStepProps) {
  const { sucursal, paciente, prestacion, profesional, slot } = data

  return (
    <div className="flex flex-col gap-7">

      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              stroke="#3A6080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Confirma tu reserva</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Revisa los datos antes de enviar la solicitud
          </p>
        </div>
      </div>

      {/* Resumen estructurado */}
      <div className="bg-neutral-0 rounded-2xl border border-neutral-100 px-5 py-4 flex flex-col gap-5 shadow-xs">

        <Section title="Sucursal">
          <Row label="Nombre"    value={sucursal?.nombre ?? ''} accent />
          <Row label="Dirección" value={sucursal?.direccion ?? ''} />
        </Section>

        <div className="border-t border-neutral-50" />

        <Section title="Paciente">
          <Row label="Nombre completo" value={`${paciente?.nombre} ${paciente?.apellido}`} />
          <Row label="RUT"      value={paciente?.rut      ?? ''} />
          <Row label="Email"    value={paciente?.email    ?? ''} />
          <Row label="Teléfono" value={paciente?.telefono ?? ''} />
          {paciente?.motivo && (
            <Row label="Motivo" value={paciente.motivo} />
          )}
        </Section>

        <div className="border-t border-neutral-50" />

        <Section title="Cita">
          <Row label="Prestación"  value={prestacion?.nombre ?? ''} accent />
          <Row label="Duración"    value={`${prestacion?.duracion_minutos} min`} />
          <Row label="Profesional" value={profesional?.nombre_display ?? ''} />
          <Row label="Fecha y hora" value={fechaLarga(slot?.fecha ?? '', slot?.hora_inicio ?? '')} accent />
        </Section>

      </div>

      {/* Error al confirmar */}
      {errorConfirm && (
        <div className="bg-error-bg border border-error-border rounded-xl px-4 py-3">
          <p className="text-sm text-error-text">{errorConfirm}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-1 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack} disabled={confirming}>← Volver</Button>
        <Button fullWidth onClick={onConfirm} disabled={confirming}>
          {confirming ? 'Agendando…' : 'Agenda tu cita'}
        </Button>
      </div>

    </div>
  )
}
