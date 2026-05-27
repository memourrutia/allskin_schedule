import { useState } from 'react'
import type { Paciente } from '../../types/booking'
import { dentalinkService } from '../../services/dentalink'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface PatientFormStepProps {
  initial: Paciente | null
  onNext:  (paciente: Paciente) => void
  onBack:  () => void
}

// ─── Fases del paso ───────────────────────────────────────────────────────────
type Phase =
  | 'rut'         // solo pide el RUT
  | 'searching'   // buscando en Dentalink (mock con delay)
  | 'found'       // paciente encontrado → confirmar datos
  | 'new'         // paciente no encontrado → formulario completo

// ─── Estado del formulario de paciente nuevo ──────────────────────────────────
interface NewForm {
  nombre:   string
  apellido: string
  email:    string
  telefono: string
  motivo:   string
}

type NewErrors = Partial<Record<keyof NewForm, string>>

function validarNuevo(f: NewForm): NewErrors {
  const e: NewErrors = {}
  if (!f.nombre.trim())    e.nombre   = 'El nombre es requerido'
  if (!f.apellido.trim())  e.apellido = 'El apellido es requerido'
  if (!f.telefono.trim())  e.telefono = 'El teléfono es requerido'
  if (!f.email.trim()) {
    e.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    e.email = 'Ingresa un email válido'
  }
  return e
}

// ─── Sub-componente: fila de dato del paciente encontrado ────────────────────
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-neutral-100 last:border-0">
      <span className="text-sm text-neutral-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-neutral-800 text-right">{value}</span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PatientFormStep({ initial, onNext, onBack }: PatientFormStepProps) {

  // Determinar fase inicial (si vuelven desde un paso posterior)
  const [phase, setPhase] = useState<Phase>(() => {
    if (!initial) return 'rut'
    // Vienen de vuelta: si el RUT existe en el mock, restaurar 'found'; si no, 'new'
    return 'found'
  })

  const [rut,       setRut]       = useState(initial?.rut ?? '')
  const [rutError,  setRutError]  = useState('')
  const [found,     setFound]     = useState<Paciente | null>(
    // Si hay datos iniciales, intenta reconstruir el paciente encontrado
    initial ? { ...initial } : null
  )
  const [form,   setForm]   = useState<NewForm>({
    nombre:   initial?.nombre   ?? '',
    apellido: initial?.apellido ?? '',
    email:    initial?.email    ?? '',
    telefono: initial?.telefono ?? '',
    motivo:   initial?.motivo   ?? '',
  })
  const [errors, setErrors] = useState<NewErrors>({})

  const setField = (field: keyof NewForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  // ─── Buscar RUT ─────────────────────────────────────────────────────────────
  const handleBuscar = async () => {
    const rutTrim = rut.trim()
    if (!rutTrim) { setRutError('Ingresa tu RUT para continuar'); return }
    setRutError('')
    setPhase('searching')

    const paciente = await dentalinkService.buscarPaciente(rutTrim)

    if (paciente) {
      setFound(paciente)
      setPhase('found')
    } else {
      setPhase('new')
    }
  }

  // ─── Confirmar paciente encontrado ──────────────────────────────────────────
  const handleConfirmar = () => {
    if (found) onNext({ ...found, rut: found.rut || rut })
  }

  // ─── Paciente nuevo → enviar formulario ─────────────────────────────────────
  const handleSubmitNuevo = () => {
    const errs = validarNuevo(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext({ ...form, rut })
  }

  // ─── Volver a ingresar el RUT ────────────────────────────────────────────────
  const handleCambiarRut = () => {
    setFound(null)
    setPhase('rut')
  }

  // ─── Encabezado común ────────────────────────────────────────────────────────
  const StepHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="#3A6080" strokeWidth="1.8"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#3A6080" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
        <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 1: Ingreso de RUT
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'rut') {
    return (
      <div className="flex flex-col gap-7">
        <StepHeader
          title="Ingresa tu RUT"
          subtitle="Te buscamos en el sistema para agilizar tu agendamiento"
        />

        <div className="flex flex-col gap-3">
          <Input
            label="RUT"
            required
            value={rut}
            onChange={e => { setRut(e.target.value); setRutError('') }}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            error={rutError}
            placeholder="Ej: 12.345.678-9"
            hint="Con o sin puntos y guión"
            autoFocus
            autoComplete="off"
          />

        </div>

        <div className="flex gap-3 pt-1 border-t border-neutral-100">
          <Button variant="ghost" onClick={onBack}>← Volver</Button>
          <Button fullWidth onClick={handleBuscar}>
            Buscar →
          </Button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 2: Buscando (loading)
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'searching') {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-16">
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-neutral-700">Buscando tu RUT…</p>
          <p className="text-sm text-neutral-400 mt-1">
            Consultando en el sistema de la clínica
          </p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 3: Paciente encontrado → confirmar datos
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'found' && found) {
    return (
      <div className="flex flex-col gap-7">
        <div className="flex items-start gap-3">
          {/* Ícono de éxito */}
          <div className="w-9 h-9 rounded-xl bg-success-bg border border-success-border flex items-center justify-center shrink-0 mt-0.5">
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <path d="M1 6l4 4 8-9" stroke="#059669" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-800">¡Te encontramos!</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Eres paciente de Alpes Dental. Confirma que tus datos estén correctos.
            </p>
          </div>
        </div>

        {/* Tarjeta de datos */}
        <div className="bg-neutral-0 rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="bg-brand-50 px-5 py-3 border-b border-brand-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-neutral-0 font-bold text-sm shrink-0">
              {found.nombre[0]}{found.apellido[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-brand-700">
                {found.nombre} {found.apellido}
              </p>
              <p className="text-xs text-brand-500">Paciente registrado</p>
            </div>
          </div>
          <div className="px-5 py-1">
            <DataRow label="RUT"      value={found.rut} />
            <DataRow label="Email"    value={found.email} />
            <DataRow label="Teléfono" value={found.telefono} />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={handleConfirmar}>
            Confirmar y continuar →
          </Button>

          <div className="flex items-center justify-between">
            <button
              onClick={handleCambiarRut}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
            >
              Cambiar RUT
            </button>
            <button
              onClick={() => {
                // Ir a formulario pre-llenado con los datos encontrados
                setForm({
                  nombre:   found.nombre,
                  apellido: found.apellido,
                  email:    found.email,
                  telefono: found.telefono,
                  motivo:   '',
                })
                setPhase('new')
              }}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
            >
              Estos no son mis datos →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 4: Paciente nuevo → formulario completo
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start gap-3">
        {/* Ícono informativo */}
        <div className="w-9 h-9 rounded-xl bg-warning-bg border border-warning-border flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-warning-text text-base leading-none">✦</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Ingresa tus datos</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            No encontramos tu RUT{' '}
            <span className="font-mono font-semibold text-neutral-700">{rut}</span>{' '}
            en el sistema. Completa tu información para continuar.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            required
            value={form.nombre}
            onChange={setField('nombre')}
            error={errors.nombre}
            placeholder="María"
            autoComplete="given-name"
            autoFocus
          />
          <Input
            label="Apellido"
            required
            value={form.apellido}
            onChange={setField('apellido')}
            error={errors.apellido}
            placeholder="González"
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Teléfono"
          type="tel"
          required
          value={form.telefono}
          onChange={setField('telefono')}
          error={errors.telefono}
          placeholder="+56 9 1234 5678"
          autoComplete="tel"
        />

        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={setField('email')}
          error={errors.email}
          placeholder="maria@correo.com"
          hint="Te enviaremos la confirmación aquí"
          autoComplete="email"
        />

        {/* Motivo opcional */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
            Motivo de consulta
            <span className="text-xs text-neutral-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={form.motivo}
            onChange={setField('motivo')}
            placeholder="Describe brevemente tu motivo de consulta..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-neutral-0 text-neutral-900
              text-sm placeholder:text-neutral-400 resize-none
              focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400 transition"
          />
        </div>
      </div>

      {/* Privacidad */}
      <p className="text-xs text-neutral-400 flex items-start gap-1.5 -mt-2">
        <span className="shrink-0">🔒</span>
        Tus datos son confidenciales y se usan solo para coordinar tu cita.
      </p>

      {/* Acciones */}
      <div className="flex flex-col gap-2 pt-1 border-t border-neutral-100">
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleCambiarRut}>← Cambiar RUT</Button>
          <Button fullWidth onClick={handleSubmitNuevo}>Continuar →</Button>
        </div>
      </div>
    </div>
  )
}
