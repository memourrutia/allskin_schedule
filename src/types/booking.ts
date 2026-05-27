// ─── INTEGRACIÓN DENTALINK ────────────────────────────────────────────────────
//
// Estos tipos modelan las entidades reales de Dentalink.
// Los campos `id_dentalink` son null mientras se usan datos mock.
// Cuando se conecte la API real, se reemplazará la capa de datos (mockDentalink.ts)
// sin necesidad de cambiar estos tipos.

/** ID numérico de Dentalink. null mientras no hay conexión real. */
export type DentalinkId = number | null

// ─── SUCURSAL ─────────────────────────────────────────────────────────────────

export interface Sucursal {
  /** Slug interno usado en mock y como clave de cache */
  id: string
  /** ID real de la sucursal en Dentalink. null hasta conectar la API. */
  id_dentalink: DentalinkId
  nombre: string
  direccion: string
  telefono: string
  email: string
  comuna?: string
  ciudad?: string
  activa: boolean
}

// ─── PRESTACIÓN ───────────────────────────────────────────────────────────────

export interface Prestacion {
  /** Slug interno */
  id: string
  /** ID del tratamiento en Dentalink. null hasta conectar. */
  id_dentalink: DentalinkId
  nombre: string
  descripcion: string
  duracion_minutos: number
  /** Precio referencial — en producción vendrá de Dentalink */
  precio_referencial?: number
  activa: boolean
}

// ─── PROFESIONAL ──────────────────────────────────────────────────────────────

export interface Profesional {
  /** Slug interno */
  id: string
  /** ID del profesional en Dentalink. null hasta conectar. */
  id_dentalink: DentalinkId
  titulo: string           // "Dr." | "Dra." | ""
  nombre: string
  apellido: string
  /** Nombre para mostrar en UI, p.ej. "Dr. Juan Pérez" */
  nombre_display: string
  especialidad: string
  /** Dos letras para el avatar cuando no hay foto */
  iniciales: string
  sucursal_id: string
  /** IDs de las prestaciones que este profesional atiende */
  prestacion_ids: string[]
  activo: boolean
}

// ─── SLOT DE HORARIO ──────────────────────────────────────────────────────────

export type EstadoSlot =
  | 'disponible'  // libre para reservar
  | 'ocupado'     // ya tiene una cita
  | 'bloqueado'   // bloqueado por la clínica (colación, reunión, etc.)
  | 'pasado'      // fecha/hora ya transcurrida

export interface Slot {
  /** ID compuesto: "{profesional_id}-{fecha}-{hora_inicio}" */
  id: string
  /** ID del bloque de agenda en Dentalink. null hasta conectar. */
  id_dentalink: DentalinkId
  fecha: string           // YYYY-MM-DD
  hora_inicio: string     // HH:MM
  hora_fin: string        // HH:MM
  profesional_id: string
  sucursal_id: string
  estado: EstadoSlot
}

// ─── PACIENTE ─────────────────────────────────────────────────────────────────

export interface Paciente {
  nombre: string
  apellido: string
  rut: string
  telefono: string
  email: string
  motivo?: string  // motivo de consulta opcional
}

// ─── RESERVA / CITA ───────────────────────────────────────────────────────────

export type EstadoReserva =
  | 'pendiente'    // creada, sin confirmar por la clínica
  | 'confirmada'   // la clínica confirmó la cita
  | 'en_atencion'  // paciente en box
  | 'completada'   // atención finalizada
  | 'cancelada'    // cancelada por paciente o clínica
  | 'no_asistio'   // paciente no se presentó

export interface Reserva {
  /** ID interno del mock */
  id: string
  /** ID de la cita en Dentalink. null hasta conectar la API. */
  id_dentalink: DentalinkId
  /** Número de referencia visible para el paciente, p.ej. "ALPES-A4B2C1" */
  numero_referencia: string
  paciente: Paciente
  prestacion_id: string
  profesional_id: string
  slot_id: string
  sucursal_id: string
  fecha: string        // YYYY-MM-DD
  hora_inicio: string  // HH:MM
  estado: EstadoReserva
  notas?: string
  creada_en: string    // ISO 8601
}

// ─── ESTADO DEL FORMULARIO DE RESERVA ────────────────────────────────────────
// Representa el estado acumulado durante el flujo de agendamiento.

export interface BookingFormData {
  sucursal:    Sucursal   | null
  paciente:    Paciente   | null
  prestacion:  Prestacion | null
  profesional: Profesional | null
  slot:        Slot        | null
}

// ─── RESULTADO DE UNA RESERVA COMPLETADA ──────────────────────────────────────

export interface BookingResult {
  ok:       boolean
  reserva?: Reserva
  error?:   string
}

// ─── ESTADO DE CONEXIÓN DENTALINK ─────────────────────────────────────────────
// Para cuando se implemente la conexión real, la UI mostrará el estado.

export type EstadoConexion =
  | 'mock'        // sin conexión — datos locales
  | 'conectando'  // intentando conectar con la API
  | 'conectado'   // API respondiendo
  | 'error'       // fallo de conexión

export interface ConexionDentalink {
  estado: EstadoConexion
  mensaje?: string
  ultimo_sync?: string  // ISO timestamp
}

// ─── HELPERS DE DISPLAY ───────────────────────────────────────────────────────

export const ESTADO_RESERVA_LABEL: Record<EstadoReserva, string> = {
  pendiente:   'Pendiente de confirmación',
  confirmada:  'Confirmada',
  en_atencion: 'En atención',
  completada:  'Completada',
  cancelada:   'Cancelada',
  no_asistio:  'No asistió',
}

export const ESTADO_SLOT_LABEL: Record<EstadoSlot, string> = {
  disponible: 'Disponible',
  ocupado:    'Ocupado',
  bloqueado:  'No disponible',
  pasado:     'Pasado',
}
