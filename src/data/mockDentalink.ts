// ─── DATOS MOCK — SIMULACIÓN DE DENTALINK ────────────────────────────────────
//
// Este archivo reemplaza completamente la capa de datos real de Dentalink.
// Cuando se conecte la API, se crea un archivo `dentalink.ts` con las mismas
// firmas de función y se hace swap — los componentes no cambian.
//
// REGLAS:
//   ✗ No hay fetch(), axios, ni llamadas HTTP aquí.
//   ✗ No hay tokens ni credenciales.
//   ✓ Todos los id_dentalink son null (se llenarán al conectar la API real).
//   ✓ Los slots se generan de forma determinista (mismo resultado en cada render).

import type {
  Sucursal,
  Prestacion,
  Profesional,
  Slot,
  EstadoSlot,
  Reserva,
  EstadoReserva,
  Paciente,
  ConexionDentalink,
} from '../types/booking'

// ─── ESTADO DE CONEXIÓN ───────────────────────────────────────────────────────

export const MOCK_CONEXION: ConexionDentalink = {
  estado:  'mock',
  mensaje: 'Usando datos locales — sin conexión a Dentalink',
}

// ─── SUCURSAL ─────────────────────────────────────────────────────────────────

export const MOCK_SUCURSAL: Sucursal = {
  id:           'allskin-alpes',
  id_dentalink: null,          // se llenará con el ID real al conectar
  nombre:       'Allskin-Alpes',
  direccion:    'Marchant Pereira 228, Providencia',
  telefono:     '+56 9 3263 0861',
  email:        'alpes@allskin.cl',
  comuna:       'Providencia',
  ciudad:       'Santiago',
  activa:       true,
}

// ─── PRESTACIONES ─────────────────────────────────────────────────────────────

export const MOCK_PRESTACIONES: Prestacion[] = [
  {
    id:               'evaluacion-allskin',
    id_dentalink:     null,
    nombre:           'Evaluación AllSKIN',
    descripcion:      'Primera consulta de estética facial: diagnóstico de piel, definición de objetivos y plan de tratamiento personalizado',
    duracion_minutos: 30,
    activa:           true,
  },
  {
    id:               'continuacion-tratamiento',
    id_dentalink:     null,
    nombre:           'Continuación de tratamiento',
    descripcion:      'Sesión de seguimiento de tu plan de tratamiento estético en curso',
    duracion_minutos: 60,
    activa:           true,
  },
]

// ─── PROFESIONALES ────────────────────────────────────────────────────────────
//
// El profesional "por-asignar" es un comodín: acepta todas las prestaciones
// y la clínica asigna al profesional real al confirmar la cita.

export const MOCK_PROFESIONALES: Profesional[] = [
  {
    id:             'prof-demo-1',
    id_dentalink:   null,
    titulo:         'Esp.',
    nombre:         'Profesional',
    apellido:       'Demo 1',
    nombre_display: 'Esp. Profesional Demo 1',
    especialidad:   'Estética Facial y Tratamientos Dérmicos',
    iniciales:      'D1',
    sucursal_id:    'allskin-alpes',
    prestacion_ids: ['evaluacion-allskin', 'continuacion-tratamiento'],
    activo:         true,
  },
  {
    id:             'prof-demo-2',
    id_dentalink:   null,
    titulo:         'Esp.',
    nombre:         'Profesional',
    apellido:       'Demo 2',
    nombre_display: 'Esp. Profesional Demo 2',
    especialidad:   'Medicina Estética y Rejuvenecimiento Facial',
    iniciales:      'D2',
    sucursal_id:    'allskin-alpes',
    prestacion_ids: ['evaluacion-allskin', 'continuacion-tratamiento'],
    activo:         true,
  },
  {
    id:             'por-asignar',
    id_dentalink:   null,
    titulo:         '',
    nombre:         'Cualquier profesional',
    apellido:       'disponible',
    nombre_display: 'Cualquier profesional disponible',
    especialidad:   'El equipo AllSKIN asignará al especialista al confirmar',
    iniciales:      'CP',
    sucursal_id:    'allskin-alpes',
    prestacion_ids: ['evaluacion-allskin', 'continuacion-tratamiento'],
    activo:         true,
  },
]

// ─── GENERACIÓN DETERMINISTA DE SLOTS ─────────────────────────────────────────
//
// Se usa FNV-1a para que la disponibilidad sea consistente entre renders
// (el mismo slot siempre tiene el mismo estado, sin Math.random()).

function fnv1a(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h / 4294967295  // normaliza a [0, 1]
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number)
  const total  = h * 60 + m + minutos
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function proximasFechasHabiles(n: number): string[] {
  const fechas: string[] = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() + 1)  // empezar desde mañana
  while (fechas.length < n) {
    const dia = cursor.getDay()
    if (dia !== 0 && dia !== 6) {
      fechas.push(cursor.toISOString().split('T')[0])
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return fechas
}

// Bloques horarios de la sucursal — 30 min cada uno
const BLOQUES_MANANA = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30']
const BLOQUES_TARDE  = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
const BLOQUES_TODOS  = [...BLOQUES_MANANA, ...BLOQUES_TARDE]

// Configuración de horario y disponibilidad por profesional
const CONFIG_PROF: Record<string, { bloques: string[]; umbral: number }> = {
  'prof-demo-1': { bloques: BLOQUES_MANANA, umbral: 0.28 }, // 72% disponible, mañanas
  'prof-demo-2': { bloques: BLOQUES_TARDE,  umbral: 0.28 }, // 72% disponible, tardes
  'por-asignar': { bloques: BLOQUES_TODOS,  umbral: 0.20 }, // 80% disponible, todo el día
}

function generarSlots(profesional: Profesional): Slot[] {
  const slots: Slot[]  = []
  const fechas = proximasFechasHabiles(10)
  const config = CONFIG_PROF[profesional.id] ?? { bloques: BLOQUES_TODOS, umbral: 0.30 }

  for (const fecha of fechas) {
    for (const hora of config.bloques) {
      const id    = `${profesional.id}-${fecha}-${hora}`
      const valor = fnv1a(id)

      let estado: EstadoSlot
      if (valor < config.umbral * 0.6) {
        estado = 'ocupado'
      } else if (valor < config.umbral) {
        estado = 'bloqueado'
      } else {
        estado = 'disponible'
      }

      slots.push({
        id,
        id_dentalink:  null,
        fecha,
        hora_inicio:   hora,
        hora_fin:      sumarMinutos(hora, 30),
        profesional_id: profesional.id,
        sucursal_id:   'allskin-alpes',
        estado,
      })
    }
  }
  return slots
}

// Precalcula todos los slots al cargar el módulo
const _TODOS_LOS_SLOTS: Slot[] = MOCK_PROFESIONALES.flatMap(generarSlots)

const _SLOTS_POR_PROF: Record<string, Slot[]> = {}
for (const slot of _TODOS_LOS_SLOTS) {
  ;(_SLOTS_POR_PROF[slot.profesional_id] ??= []).push(slot)
}

// ─── API PÚBLICA DE CONSULTA DE SLOTS ─────────────────────────────────────────
// Estas funciones tienen la misma firma que tendrán cuando llamen a Dentalink real.

/** Todos los slots de un profesional (disponibles, ocupados y bloqueados). */
export function getMockSlots(profesionalId: string): Slot[] {
  return _SLOTS_POR_PROF[profesionalId] ?? []
}

/** Solo los slots disponibles de un profesional, opcionalmente filtrados por fecha. */
export function getSlotsDisponibles(profesionalId: string, fecha?: string): Slot[] {
  const slots = getMockSlots(profesionalId).filter(s => s.estado === 'disponible')
  return fecha ? slots.filter(s => s.fecha === fecha) : slots
}

/** Fechas (YYYY-MM-DD) que tienen al menos un slot disponible para ese profesional. */
export function getFechasDisponibles(profesionalId: string): string[] {
  const set = new Set(getSlotsDisponibles(profesionalId).map(s => s.fecha))
  return [...set].sort()
}

/** Busca un slot por su ID. */
export function getSlotById(slotId: string): Slot | undefined {
  return _TODOS_LOS_SLOTS.find(s => s.id === slotId)
}

/** Profesionales que atienden una prestación específica y están activos. */
export function getProfesionalesByPrestacion(prestacionId: string): Profesional[] {
  return MOCK_PROFESIONALES.filter(
    p => p.activo && p.prestacion_ids.includes(prestacionId)
  )
}

// ─── ESTADOS DE RESERVA ───────────────────────────────────────────────────────

export const MOCK_ESTADOS_RESERVA: Array<{
  estado:     EstadoReserva
  label:      string
  descripcion: string
  color:      'warning' | 'info' | 'brand' | 'success' | 'error'
}> = [
  {
    estado:      'pendiente',
    label:       'Pendiente',
    descripcion: 'Solicitud recibida, en espera de confirmación por la clínica',
    color:       'warning',
  },
  {
    estado:      'confirmada',
    label:       'Confirmada',
    descripcion: 'La clínica confirmó la cita',
    color:       'info',
  },
  {
    estado:      'en_atencion',
    label:       'En atención',
    descripcion: 'El paciente está siendo atendido en este momento',
    color:       'brand',
  },
  {
    estado:      'completada',
    label:       'Completada',
    descripcion: 'Atención finalizada exitosamente',
    color:       'success',
  },
  {
    estado:      'cancelada',
    label:       'Cancelada',
    descripcion: 'Reserva cancelada por el paciente o la clínica',
    color:       'error',
  },
  {
    estado:      'no_asistio',
    label:       'No asistió',
    descripcion: 'El paciente no se presentó a la cita programada',
    color:       'error',
  },
]

// ─── BASE DE PACIENTES MOCK (simula el registro de Dentalink) ─────────────────
//
// En producción: GET /pacientes?rut={rut}
// Estos RUTs de prueba permiten testear el flujo de "paciente existente":
//   • 12.345.678-9  →  María González López (paciente encontrada)
//   • 11.111.111-1  →  Carlos Rodríguez Vega (paciente encontrado)
//   • 15.888.999-K  →  Valentina Torres Sánchez (paciente encontrada)
//   • Cualquier otro RUT → paciente nuevo (no se encuentra)

const MOCK_PACIENTES_DB: Paciente[] = [
  {
    nombre:   'María',
    apellido: 'González López',
    rut:      '12.345.678-9',
    email:    'maria.gonzalez@gmail.com',
    telefono: '+56 9 8765 4321',
  },
  {
    nombre:   'Carlos',
    apellido: 'Rodríguez Vega',
    rut:      '11.111.111-1',
    email:    'carlos.rodriguez@outlook.com',
    telefono: '+56 9 1111 2222',
  },
  {
    nombre:   'Valentina',
    apellido: 'Torres Sánchez',
    rut:      '15.888.999-K',
    email:    'valentina.torres@email.cl',
    telefono: '+56 9 9876 5432',
  },
]

/** Normaliza un RUT para comparación: elimina puntos, guión y pasa a minúsculas. */
function normalizarRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').toLowerCase().trim()
}

/**
 * Busca un paciente por RUT en la base mock.
 * Acepta cualquier formato: "12.345.678-9", "123456789", "12345678-9", etc.
 *
 * En producción: GET /pacientes?rut={rut}
 * Retorna null si el paciente no está registrado en Dentalink.
 */
export function buscarPacienteMock(rut: string): Paciente | null {
  const rutNorm = normalizarRut(rut)
  return MOCK_PACIENTES_DB.find(p => normalizarRut(p.rut) === rutNorm) ?? null
}

// ─── SIMULACIÓN DE CREACIÓN DE RESERVA ────────────────────────────────────────
//
// En producción: POST /api/dentalink/reservas
// Mock: retorna el objeto Reserva localmente sin ningún fetch.

export function crearReservaMock(
  paciente:     Paciente,
  prestacionId: string,
  profesionalId: string,
  slot:         Slot,
): Reserva {
  const ahora      = new Date().toISOString()
  const referencia = `ALPES-${Date.now().toString(36).toUpperCase().slice(-6)}`

  return {
    id:                `reserva-${Date.now()}`,
    id_dentalink:      null,
    numero_referencia: referencia,
    paciente,
    prestacion_id:     prestacionId,
    profesional_id:    profesionalId,
    slot_id:           slot.id,
    sucursal_id:       slot.sucursal_id,
    fecha:             slot.fecha,
    hora_inicio:       slot.hora_inicio,
    estado:            'pendiente',
    creada_en:         ahora,
  }
}
