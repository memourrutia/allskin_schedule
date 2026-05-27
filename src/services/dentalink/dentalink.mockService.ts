// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK — MOCK SERVICE  ← SERVICIO ACTIVO
// ─────────────────────────────────────────────────────────────────────────────
//
// Este es el único servicio en uso por la aplicación en este momento.
// Implementa IDentalinkService usando datos locales de mockDentalink.ts.
// NO hace ninguna llamada HTTP — todo es local y síncrono bajo una API async.
//
// Para cambiar a la API real:
//   1. Completar dentalink.realService.placeholder.ts
//   2. En src/services/dentalink/index.ts, reemplazar:
//        export { mockDentalinkService as dentalinkService }
//      por:
//        export { realDentalinkService as dentalinkService }
//   3. Los componentes no necesitan cambiar — consumen solo IDentalinkService.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { IDentalinkService, CreateReservaInput } from './dentalink.types'
import type { Sucursal, Prestacion, Profesional, Slot, Reserva, Paciente } from '../../types/booking'

import {
  MOCK_SUCURSAL,
  MOCK_PRESTACIONES,
  MOCK_CONEXION,
  getMockSlots,
  getFechasDisponibles,
  getProfesionalesByPrestacion,
  buscarPacienteMock,
  crearReservaMock,
} from '../../data/mockDentalink'

// Simula la latencia de una llamada a API para que el comportamiento
// sea idéntico al servicio real (con loading states).
const MOCK_DELAY_MS = 120

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── IMPLEMENTACIÓN ───────────────────────────────────────────────────────────

export const mockDentalinkService: IDentalinkService = {

  async getSucursal(): Promise<Sucursal> {
    await delay(MOCK_DELAY_MS)
    return MOCK_SUCURSAL
  },

  async getPrestaciones(): Promise<Prestacion[]> {
    await delay(MOCK_DELAY_MS)
    return MOCK_PRESTACIONES.filter(p => p.activa)
  },

  async getProfesionalesByPrestacion(prestacionId: string): Promise<Profesional[]> {
    await delay(MOCK_DELAY_MS)
    return getProfesionalesByPrestacion(prestacionId)
  },

  async getFechasDisponibles(profesionalId: string): Promise<string[]> {
    await delay(MOCK_DELAY_MS)
    return getFechasDisponibles(profesionalId).slice(0, 7)
  },

  async getSlots(profesionalId: string, fecha?: string): Promise<Slot[]> {
    await delay(MOCK_DELAY_MS)
    const slots = getMockSlots(profesionalId)
    return fecha ? slots.filter(s => s.fecha === fecha) : slots
  },

  async buscarPaciente(rut: string): Promise<Paciente | null> {
    await delay(MOCK_DELAY_MS * 7)  // simula latencia de búsqueda (~840ms)
    return buscarPacienteMock(rut)
  },

  async crearReserva(input: CreateReservaInput): Promise<Reserva> {
    await delay(MOCK_DELAY_MS * 3)  // simula latencia mayor al guardar
    return crearReservaMock(
      input.paciente,
      input.prestacionId,
      input.profesionalId,
      input.slot,
    )
  },
}

// ─── ESTADO DE CONEXIÓN (solo para debug/UI informativa) ──────────────────────

export function getMockConexionStatus() {
  return MOCK_CONEXION
}
