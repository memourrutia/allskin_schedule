import type { Reserva } from '../../types/booking'
import { MOCK_PRESTACIONES, MOCK_PROFESIONALES, MOCK_SUCURSAL } from '../../data/mockDentalink'
import { Button } from '../ui/Button'
import logoAlpesDental from '../../assets/logo-alpes-dental.png'

interface SuccessStepProps {
  reserva:  Reserva
  onReset:  () => void
}

const DIAS_ES  = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function fechaLarga(fecha: string, hora: string): string {
  const d = new Date(fecha + 'T12:00:00')
  return `${DIAS_ES[d.getDay()]} ${d.getDate()} de ${MESES_ES[d.getMonth()]} a las ${hora} h`
}

export function SuccessStep({ reserva, onReset }: SuccessStepProps) {
  const prestacion  = MOCK_PRESTACIONES.find(p => p.id === reserva.prestacion_id)
  const profesional = MOCK_PROFESIONALES.find(p => p.id === reserva.profesional_id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-8">

        {/* ── Marca institucional ───────────────────────────── */}
        <div className="flex flex-col items-center gap-1">
          <img
            src={logoAlpesDental}
            alt="Alpes Dental"
            className="h-10 w-auto object-contain"
            draggable={false}
          />
          <p className="text-xs text-neutral-400">Sucursal Allskin · Alpes</p>
        </div>

        {/* ── Ícono de éxito ────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-success-bg border-2 border-success-border flex items-center justify-center shadow-lg">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <circle cx="22" cy="22" r="20" fill="#ECFDF5"/>
                <path d="M12 22l7 7 13-14" stroke="#059669" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Anillo decorativo */}
            <div className="absolute -inset-2 rounded-full border border-success-border opacity-40" />
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-800">
              ¡Cita agendada!
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
              Tu cita fue registrada correctamente en nuestro sistema.
            </p>
          </div>
        </div>

        {/* ── Número de referencia ──────────────────────────── */}
        <div className="w-full bg-brand-50 border border-brand-100 rounded-2xl px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-500 mb-1">
            Número de cita
          </p>
          <p className="text-3xl font-black text-brand-700 tracking-widest font-mono">
            {reserva.numero_referencia}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Guarda este número como referencia para cualquier consulta
          </p>
        </div>

        {/* ── Resumen de la cita ────────────────────────────── */}
        <div className="w-full bg-neutral-0 border border-neutral-100 rounded-2xl shadow-xs overflow-hidden text-left">
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
              Resumen de tu cita
            </p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3 text-sm">
            {[
              { label: 'Sucursal',    value: MOCK_SUCURSAL.nombre },
              { label: 'Prestación',  value: prestacion?.nombre },
              { label: 'Profesional', value: profesional?.nombre_display },
              { label: 'Fecha',       value: fechaLarga(reserva.fecha, reserva.hora_inicio) },
              { label: 'Paciente',    value: `${reserva.paciente.nombre} ${reserva.paciente.apellido}` },
              { label: 'Contacto',    value: reserva.paciente.email },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex items-start justify-between gap-4">
                <span className="text-neutral-400 shrink-0">{label}</span>
                <span className="font-semibold text-neutral-800 text-right">{value}</span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* ── Recordatorio ─────────────────────────────────── */}
        <div className="w-full flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-left">
          <span className="text-brand-500 text-base shrink-0">📅</span>
          <p className="text-sm text-brand-700 leading-relaxed">
            Recuerda que tu cita será confirmada el día antes de la atención.
          </p>
        </div>

        {/* ── Acciones finales ──────────────────────────────── */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onReset}>
            Agendar otra cita
          </Button>
          <p className="text-xs text-neutral-400">
            ¿Necesitas cancelar o modificar?{' '}
            <a href={`tel:${MOCK_SUCURSAL.telefono.replace(/\s/g, '')}`}
              className="text-brand-600 hover:underline font-semibold">
              {MOCK_SUCURSAL.telefono}
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
