import { useBooking }       from './hooks/useBooking'
import { StepIndicator }   from './components/ui/StepIndicator'
import { BookingSummary }  from './components/ui/BookingSummary'
import { Header }          from './components/layout/Header'
import { Footer }          from './components/layout/Footer'
import { WelcomeStep }     from './components/steps/WelcomeStep'
import { PatientFormStep } from './components/steps/PatientFormStep'
import { ServiceStep }     from './components/steps/ServiceStep'
import { ProfessionalStep } from './components/steps/ProfessionalStep'
import { DateTimeStep }    from './components/steps/DateTimeStep'
import { ConfirmationStep } from './components/steps/ConfirmationStep'
import { SuccessStep }     from './components/steps/SuccessStep'
import type { BookingStep } from './hooks/useBooking'

// Mapa de paso → índice para el StepIndicator (0-based)
const STEP_INDEX: Partial<Record<BookingStep, number>> = {
  patient:      0,
  service:      1,
  professional: 2,
  datetime:     3,
  confirmation: 4,
}

export default function App() {
  const {
    step, data, reserva,
    confirming, errorConfirm,
    goNext, goBack,
    setPaciente, setPrestacion, setProfesional, setSlot,
    confirmar, reset,
  } = useBooking()

  const isWelcome  = step === 'welcome'
  const isSuccess  = step === 'success'
  const isFormStep = !isWelcome && !isSuccess

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">

      {/* ── Header con indicador de pasos ─────────────────────── */}
      <Header>
        {isFormStep && (
          <StepIndicator currentStep={STEP_INDEX[step] ?? 0} />
        )}
      </Header>

      {/* ── Contenido principal ────────────────────────────────── */}
      <div className="flex-1">

        {/* Paso 1: Bienvenida (hero full-width) */}
        {isWelcome && <WelcomeStep onStart={goNext} />}

        {/* Pasos 2–6: formulario + sidebar */}
        {isFormStep && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">

              {/* ── Tarjeta principal del formulario ────────── */}
              <div className="flex-1 min-w-0 bg-neutral-0 rounded-2xl shadow-sm border border-neutral-100 px-5 sm:px-7 py-6">
                {step === 'patient' && (
                  <PatientFormStep
                    initial={data.paciente}
                    onNext={(p) => { setPaciente(p); goNext() }}
                    onBack={goBack}
                  />
                )}
                {step === 'service' && (
                  <ServiceStep
                    selected={data.prestacion}
                    onSelect={setPrestacion}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {step === 'professional' && data.prestacion && (
                  <ProfessionalStep
                    prestacion={data.prestacion}
                    selected={data.profesional}
                    onSelect={setProfesional}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {step === 'datetime' && data.profesional && (
                  <DateTimeStep
                    profesional={data.profesional}
                    selected={data.slot}
                    onSelect={setSlot}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {step === 'confirmation' && (
                  <ConfirmationStep
                    data={data}
                    onConfirm={confirmar}
                    onBack={goBack}
                    confirming={confirming}
                    errorConfirm={errorConfirm}
                  />
                )}
              </div>

              {/* ── Sidebar de resumen ───────────────────────── */}
              <div className="w-full lg:w-72 xl:w-80 lg:sticky lg:top-28 shrink-0">
                <BookingSummary data={data} step={step} />
              </div>

            </div>
          </div>
        )}

        {/* Paso 7: Éxito (full-width institucional) */}
        {isSuccess && reserva && (
          <SuccessStep reserva={reserva} onReset={reset} />
        )}

      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Footer />

    </div>
  )
}
