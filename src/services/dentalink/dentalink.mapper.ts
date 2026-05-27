// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK — MAPPER (API raw → tipos internos)
// ─────────────────────────────────────────────────────────────────────────────
//
// Convierte los shapes crudos de la API de Dentalink a los tipos internos
// definidos en src/types/booking.ts.
//
// ESTADO ACTUAL: funciones de conversión definidas pero sin uso activo.
//   - El mock service NO necesita estas funciones (ya tiene datos en formato interno).
//   - El real service las usará cuando se conecte la API.
//
// CUÁNDO ACTIVAR:
//   - Cuando dentalink.realService.placeholder.ts deje de ser un placeholder.
//   - Los componentes React no deben importar este archivo directamente.
//
// ─────────────────────────────────────────────────────────────────────────────

import type {
  DentalinkSucursal,
  DentalinkProfesional,
  DentalinkAtencion,
  DentalinkBloqueAgenda,
  DentalinkCita,
  DentalinkPaciente,
  DentalinkEstadoCita,
} from './dentalink.types'

import type {
  Sucursal,
  Profesional,
  Prestacion,
  Slot,
  EstadoSlot,
  Reserva,
  EstadoReserva,
  Paciente,
} from '../../types/booking'

// ─── SUCURSAL ─────────────────────────────────────────────────────────────────

export function mapSucursal(d: DentalinkSucursal): Sucursal {
  return {
    id:           `sucursal-${d.id}`,
    id_dentalink: d.id,
    nombre:       d.nombre,
    direccion:    d.direccion,
    telefono:     d.telefono,
    email:        d.email,
    activa:       d.activo,
  }
}

// ─── PROFESIONAL ─────────────────────────────────────────────────────────────
//
// Nota: Dentalink no devuelve qué prestaciones atiende cada profesional.
// La relación profesional → prestaciones debe mantenerse en configuración local
// o consultarse con un endpoint adicional (verificar si existe en la API).

export function mapProfesional(
  d: DentalinkProfesional,
  /** IDs internos de prestaciones que atiende este profesional (configuración local) */
  prestacionIds: string[],
): Profesional {
  const titulo       = inferirTitulo(d.especialidad)
  const iniciales    = `${d.nombre[0] ?? '?'}${d.apellido[0] ?? '?'}`.toUpperCase()
  const nombre_display = `${titulo} ${d.nombre} ${d.apellido}`.trim()

  return {
    id:             `prof-${d.id}`,
    id_dentalink:   d.id,
    titulo,
    nombre:         d.nombre,
    apellido:       d.apellido,
    nombre_display,
    especialidad:   d.especialidad,
    iniciales,
    sucursal_id:    `sucursal-${d.id_sucursal}`,
    prestacion_ids: prestacionIds,
    activo:         d.activo,
  }
}

function inferirTitulo(especialidad: string): string {
  // Heurística básica — ajustar según datos reales de Dentalink
  const lower = especialidad.toLowerCase()
  if (lower.includes('dra') || lower.includes('doctora')) return 'Dra.'
  if (lower.includes('dr')  || lower.includes('doctor'))  return 'Dr.'
  return ''
}

// ─── PRESTACIÓN (ATENCIÓN EN DENTALINK) ──────────────────────────────────────

export function mapPrestacion(d: DentalinkAtencion): Prestacion {
  return {
    id:                `prest-${d.id}`,
    id_dentalink:      d.id,
    nombre:            d.nombre,
    descripcion:       '',          // Dentalink no devuelve descripción — completar manualmente
    duracion_minutos:  d.duracion,
    precio_referencial: d.precio,
    activa:            d.activo,
  }
}

// ─── SLOT (BLOQUE DE AGENDA) ──────────────────────────────────────────────────
//
// hora_inicio de Dentalink viene como "HH:MM:SS" — se trunca a "HH:MM".

export function mapSlot(d: DentalinkBloqueAgenda): Slot {
  return {
    id:             `slot-${d.id}`,
    id_dentalink:   d.id,
    fecha:          d.fecha,
    hora_inicio:    truncarHora(d.hora_inicio),
    hora_fin:       truncarHora(d.hora_fin),
    profesional_id: `prof-${d.id_profesional}`,
    sucursal_id:    `sucursal-${d.id_sucursal}`,
    estado:         mapEstadoBloque(d.estado),
  }
}

function truncarHora(hhmmss: string): string {
  // "09:30:00" → "09:30"
  return hhmmss.slice(0, 5)
}

function mapEstadoBloque(estado: DentalinkBloqueAgenda['estado']): EstadoSlot {
  const mapa: Record<string, EstadoSlot> = {
    libre:     'disponible',
    ocupado:   'ocupado',
    bloqueado: 'bloqueado',
  }
  return mapa[estado] ?? 'bloqueado'
}

// ─── CITA → RESERVA ───────────────────────────────────────────────────────────
//
// Al crear una cita en Dentalink, la API devuelve el objeto DentalinkCita.
// Este mapper lo convierte a nuestra Reserva interna.
// El paciente se recibe por separado (ya lo tenemos del formulario).

export function mapCitaToReserva(
  d: DentalinkCita,
  paciente: Paciente,
  numero_referencia: string,
): Reserva {
  return {
    id:                `reserva-${d.id}`,
    id_dentalink:      d.id,
    numero_referencia,
    paciente,
    prestacion_id:     `prest-${d.id_atencion}`,
    profesional_id:    `prof-${d.id_profesional}`,
    slot_id:           d.id_bloque ? `slot-${d.id_bloque}` : '',
    sucursal_id:       `sucursal-${d.id_sucursal}`,
    fecha:             d.fecha,
    hora_inicio:       truncarHora(d.hora_inicio),
    estado:            mapEstadoCita(d.estado),
    creada_en:         d.creado_en,
  }
}

function mapEstadoCita(estado: DentalinkEstadoCita): EstadoReserva {
  const mapa: Record<DentalinkEstadoCita, EstadoReserva> = {
    pendiente:   'pendiente',
    confirmada:  'confirmada',
    en_atencion: 'en_atencion',
    completada:  'completada',
    cancelada:   'cancelada',
    no_asistio:  'no_asistio',
  }
  return mapa[estado] ?? 'pendiente'
}

// ─── PACIENTE DENTALINK → INTERNO ─────────────────────────────────────────────
//
// Se usa para verificar si un paciente ya existe en Dentalink al buscar por RUT.

export function mapPacienteDentalink(d: DentalinkPaciente): Paciente {
  return {
    nombre:   d.nombre,
    apellido: d.apellido,
    rut:      d.rut,
    email:    d.email,
    telefono: d.telefono,
  }
}
