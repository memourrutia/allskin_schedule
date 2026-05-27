import { useState } from 'react'
import type {
  BookingFormData,
  Paciente,
  Prestacion,
  Profesional,
  Slot,
  Reserva,
} from '../types/booking'
import { MOCK_SUCURSAL } from '../data/mockDentalink'
import { dentalinkService } from '../services/dentalink'

export type BookingStep =
  | 'welcome'
  | 'patient'
  | 'service'
  | 'professional'
  | 'datetime'
  | 'confirmation'
  | 'success'

const STEPS: BookingStep[] = [
  'welcome',
  'patient',
  'service',
  'professional',
  'datetime',
  'confirmation',
  'success',
]

const INITIAL_DATA: BookingFormData = {
  sucursal:    MOCK_SUCURSAL,
  paciente:    null,
  prestacion:  null,
  profesional: null,
  slot:        null,
}

export function useBooking() {
  const [step,       setStep]       = useState<BookingStep>('welcome')
  const [data,       setData]       = useState<BookingFormData>(INITIAL_DATA)
  const [reserva,    setReserva]    = useState<Reserva | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [errorConfirm, setErrorConfirm] = useState<string | null>(null)

  const goNext = () => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const goBack = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const setPaciente    = (paciente: Paciente)       => setData(d => ({ ...d, paciente }))
  const setPrestacion  = (prestacion: Prestacion)   => setData(d => ({ ...d, prestacion, profesional: null, slot: null }))
  const setProfesional = (profesional: Profesional) => setData(d => ({ ...d, profesional, slot: null }))
  const setSlot        = (slot: Slot)               => setData(d => ({ ...d, slot }))

  const confirmar = async () => {
    if (!data.paciente || !data.prestacion || !data.profesional || !data.slot) return

    setConfirming(true)
    setErrorConfirm(null)

    try {
      const r = await dentalinkService.crearReserva({
        paciente:      data.paciente,
        prestacionId:  data.prestacion.id,
        profesionalId: data.profesional.id,
        slot:          data.slot,
      })
      setReserva(r)
      goNext()
    } catch (err) {
      setErrorConfirm(
        err instanceof Error ? err.message : 'No se pudo confirmar la reserva. Intenta de nuevo.'
      )
    } finally {
      setConfirming(false)
    }
  }

  const reset = () => {
    setData(INITIAL_DATA)
    setReserva(null)
    setErrorConfirm(null)
    setStep('welcome')
  }

  return {
    step, data, reserva,
    confirming, errorConfirm,
    goNext, goBack,
    setPaciente, setPrestacion, setProfesional, setSlot,
    confirmar, reset,
  }
}
