// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK API SERVICE — Servicio real para el frontend
// ─────────────────────────────────────────────────────────────────────────────
//
// El frontend llama a NUESTROS propios endpoints /api/* (Vercel Functions).
// Esos endpoints llaman a Dentalink en el servidor con el token.
// El token NUNCA llega al navegador.
//
// Frontend → /api/dentalink-* → Dentalink
//
// ─────────────────────────────────────────────────────────────────────────────

import type { IDentalinkService, CreateReservaInput } from './dentalink.types'
import type { Sucursal, Prestacion, Profesional, Slot, Reserva, Paciente } from '../../types/booking'
import { MOCK_SUCURSAL, MOCK_PRESTACIONES } from '../../data/mockDentalink'

// ─── Shapes de respuesta de nuestros endpoints /api/* ────────────────────────

interface ApiDentist {
  id:           string
  name:         string
  especialidad: string | null
}

interface ApiSlot {
  hora_inicio:    string
  hora_fin:       string
  duracion:       number
  id_dentista:    number
  nombre_dentista: string
  fecha:          string   // DD/MM/YYYY — formato que devuelve Dentalink
  id_recurso:     number
}

// ─── Helper fetch ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res  = await fetch(path, options)
  const body = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }))
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  return body as T
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapDentist(d: ApiDentist): Profesional {
  const palabras  = d.name.trim().split(/\s+/)
  const iniciales = palabras.map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase() || 'AS'

  return {
    id:             d.id,
    id_dentalink:   parseInt(d.id, 10),
    titulo:         '',
    nombre:         d.name,
    apellido:       '',
    nombre_display: d.name,
    especialidad:   d.especialidad ?? 'Especialista AllSKIN',
    iniciales,
    sucursal_id:    'allskin-alpes',
    // Todos los profesionales atienden ambas prestaciones (confirmado con la clínica)
    prestacion_ids: ['evaluacion-allskin', 'continuacion-tratamiento'],
    activo:         true,
  }
}

function mapSlot(s: ApiSlot, fechaISO: string): Slot {
  return {
    id:             `${s.id_dentista}-${fechaISO}-${s.hora_inicio}`,
    id_dentalink:   s.id_recurso,
    fecha:          fechaISO,
    hora_inicio:    s.hora_inicio,
    hora_fin:       s.hora_fin,
    profesional_id: String(s.id_dentista),
    sucursal_id:    'allskin-alpes',
    estado:         'disponible',
  }
}


// ─── Implementación del servicio ──────────────────────────────────────────────

export const dentalinkApiService: IDentalinkService = {

  async getSucursal(): Promise<Sucursal> {
    // La sucursal es fija en este MVP
    return MOCK_SUCURSAL
  },

  async getPrestaciones(): Promise<Prestacion[]> {
    // Las prestaciones están definidas localmente (no hay endpoint de Dentalink necesario)
    return MOCK_PRESTACIONES.filter(p => p.activa)
  },

  async getProfesionalesByPrestacion(_prestacionId: string): Promise<Profesional[]> {
    const data = await apiFetch<{ ok: boolean; dentists: ApiDentist[] }>(
      '/api/dentalink-dentists'
    )
    return data.dentists.map(mapDentist)
  },

  async getFechasDisponibles(profesionalId: string): Promise<string[]> {
    // Consulta las fechas reales con disponibilidad en Dentalink
    // mode=dates retorna solo las fechas que tienen slots libres
    const hoy    = new Date().toISOString().split('T')[0]
    const params = new URLSearchParams({ fecha: hoy, id_dentista: profesionalId, mode: 'dates' })
    const data   = await apiFetch<{ ok: boolean; fechas: string[] }>(
      `/api/dentalink-availability?${params}`
    )
    return data.fechas ?? []
  },

  async getSlots(profesionalId: string, fecha?: string): Promise<Slot[]> {
    if (!fecha) return []

    const params = new URLSearchParams({
      fecha,
      id_dentista: profesionalId,
      duracion:    '30',
    })

    const data = await apiFetch<{ ok: boolean; slots: ApiSlot[] }>(
      `/api/dentalink-availability?${params}`
    )

    return (data.slots ?? []).map(s => mapSlot(s, fecha))
  },

  async buscarPaciente(rut: string): Promise<Paciente | null> {
    const data = await apiFetch<{
      ok:      boolean
      found:   boolean
      paciente?: {
        nombre:   string
        apellido: string
        rut:      string
        email:    string
        telefono: string
      }
    }>(`/api/dentalink-patient-search?rut=${encodeURIComponent(rut)}`)

    if (!data.found || !data.paciente) return null

    return {
      nombre:   data.paciente.nombre,
      apellido: data.paciente.apellido,
      rut:      data.paciente.rut,
      email:    data.paciente.email,
      telefono: data.paciente.telefono,
    }
  },

  async crearReserva(input: CreateReservaInput): Promise<Reserva> {
    const data = await apiFetch<{ ok: boolean; numero_referencia: string }>(
      '/api/dentalink-booking',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente:       input.paciente,
          prestacion_id:  input.prestacionId,
          profesional_id: input.profesionalId,
          fecha:          input.slot.fecha,
          hora_inicio:    input.slot.hora_inicio,
          duracion:       30,
        }),
      }
    )

    return {
      id:                `booking-${Date.now()}`,
      id_dentalink:      null,
      numero_referencia: data.numero_referencia,
      paciente:          input.paciente,
      prestacion_id:     input.prestacionId,
      profesional_id:    input.profesionalId,
      slot_id:           input.slot.id,
      sucursal_id:       input.slot.sucursal_id,
      fecha:             input.slot.fecha,
      hora_inicio:       input.slot.hora_inicio,
      estado:            'pendiente',
      creada_en:         new Date().toISOString(),
    }
  },
}
