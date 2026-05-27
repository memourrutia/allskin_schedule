// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK — TIPOS CRUDOS DE LA API
// ─────────────────────────────────────────────────────────────────────────────
//
// Este archivo define los shapes que devuelve la API REST de Dentalink.
// NO se usa en producción todavía — sirve como contrato técnico de integración.
//
// Referencia: API privada de Dentalink (requiere acceso de partner/cliente).
// Endpoint base esperado: https://app.dentalink.cl/api/v1/
//
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Sucursal,
  Prestacion,
  Profesional,
  Slot,
  Paciente,
  Reserva,
} from '../../types/booking'

// ─── WRAPPER GENÉRICO DE RESPUESTA ───────────────────────────────────────────

export interface DentalinkResponse<T> {
  /** true si la petición fue exitosa */
  success: boolean
  data:    T
  /** Mensaje de error cuando success === false */
  message?: string
  errors?:  string[]
}

export interface DentalinkListResponse<T> extends DentalinkResponse<T[]> {
  total:    number
  page:     number
  per_page: number
}

// ─── AUTENTICACIÓN ────────────────────────────────────────────────────────────
//
// TODO (integración real):
//   - Dentalink usa token de autenticación por cabecera HTTP:
//       Authorization: Token <api_token>
//   - El token se genera en el panel de Dentalink → Configuración → API.
//   - NUNCA hardcodear el token en el código fuente.
//   - Usar variable de entorno: VITE_DENTALINK_API_TOKEN (sólo en backend/proxy).
//   - IMPORTANTE: No exponer el token en el frontend (riesgo de seguridad).
//     La llamada a Dentalink debe ir por un proxy/backend propio.

export interface DentalinkAuthConfig {
  /** Token de API de Dentalink — NUNCA exponer en frontend */
  apiToken: string
  /** URL base de la API — ej: https://app.dentalink.cl/api/v1 */
  baseUrl:  string
}

// ─── SUCURSAL ─────────────────────────────────────────────────────────────────
//
// TODO (integración real):
//   - Consultar GET /sucursales para obtener la lista y encontrar Allskin-Alpes.
//   - El id_sucursal real de Allskin-Alpes debe almacenarse como variable de entorno:
//       VITE_DENTALINK_SUCURSAL_ID=<número>
//   - Este ID se usará en TODOS los endpoints que requieran id_sucursal.

export interface DentalinkSucursal {
  id:        number
  nombre:    string
  direccion: string
  telefono:  string
  email:     string
  activo:    boolean
}

// ─── SILLÓN / BOX DENTAL ─────────────────────────────────────────────────────
//
// TODO (integración real):
//   - Consultar GET /sucursales/{id_sucursal}/sillones
//   - Cada cita en Dentalink requiere un id_sillon (box/sala donde se atiende).
//   - Si la clínica tiene un solo sillón, usar siempre ese ID.
//   - Si tiene varios, implementar lógica de selección (por defecto o por profesional).
//   - El id_sillon real debe almacenarse como constante configurada.

export interface DentalinkSillon {
  id:          number
  nombre:      string
  id_sucursal: number
  activo:      boolean
}

// ─── PROFESIONAL ─────────────────────────────────────────────────────────────
//
// TODO (integración real):
//   - Consultar GET /profesionales?id_sucursal={id}
//   - Mapear los IDs reales de Dentalink a los profesionales mock actuales.
//   - El mapeo provisional podría ser:
//       prof-demo-1  →  id_dentalink: <id_real_doctor_1>
//       prof-demo-2  →  id_dentalink: <id_real_doctora_2>
//   - Una vez obtenidos los IDs reales, actualizar MOCK_PROFESIONALES en mockDentalink.ts.

export interface DentalinkProfesional {
  id:           number
  nombre:       string
  apellido:     string
  rut:          string
  especialidad: string
  id_sucursal:  number
  activo:       boolean
}

// ─── ATENCIÓN / PRESTACIÓN ───────────────────────────────────────────────────
//
// TODO (integración real):
//   - Consultar GET /atenciones o GET /prestaciones (verificar endpoint exacto).
//   - En Dentalink las "atenciones" son equivalentes a nuestras "prestaciones".
//   - Mapear id_dentalink de cada prestación mock al ID real en Dentalink.
//   - La duración en Dentalink debe coincidir con la configurada en la agenda
//     del profesional (si está fijo por tratamiento, no requiere mapeo manual).

export interface DentalinkAtencion {
  id:       number
  nombre:   string
  /** Duración en minutos */
  duracion: number
  precio:   number
  activo:   boolean
}

// ─── BLOQUE DE AGENDA / SLOT ─────────────────────────────────────────────────
//
// TODO (integración real):
//   - Consultar GET /agenda?id_profesional={id}&id_sucursal={id}&fecha_inicio={YYYY-MM-DD}&fecha_fin={YYYY-MM-DD}
//   - Los bloques libres son los disponibles para agendar.
//   - hora_inicio y hora_fin vienen en formato "HH:MM:SS" (con segundos).
//   - El id del bloque (id_bloque) puede ser necesario al crear la cita.

export interface DentalinkBloqueAgenda {
  id:            number
  id_profesional: number
  id_sucursal:   number
  id_sillon:     number
  fecha:         string   // "YYYY-MM-DD"
  hora_inicio:   string   // "HH:MM:SS"
  hora_fin:      string   // "HH:MM:SS"
  estado:        DentalinkEstadoBloque
}

export type DentalinkEstadoBloque = 'libre' | 'ocupado' | 'bloqueado'

// ─── PACIENTE ─────────────────────────────────────────────────────────────────
//
// TODO (integración real):
//   - Antes de crear una cita, Dentalink requiere un id_paciente válido.
//   - Flujo sugerido:
//       1. Buscar paciente por RUT: GET /pacientes?rut={rut}
//       2. Si existe → usar su id.
//       3. Si no existe → crear: POST /pacientes con los datos del formulario.
//       4. Guardar el id_paciente obtenido para usarlo en la creación de la cita.
//   - El RUT es el identificador único de un paciente en Chile.

export interface DentalinkPaciente {
  id:        number
  nombre:    string
  apellido:  string
  rut:       string
  email:     string
  telefono:  string
  activo:    boolean
}

export interface DentalinkCreatePacientePayload {
  nombre:   string
  apellido: string
  rut:      string
  email:    string
  telefono: string
}

// ─── CITA / RESERVA ───────────────────────────────────────────────────────────
//
// TODO (integración real):
//   - Crear cita: POST /citas
//   - Campos REQUERIDOS por Dentalink:
//       id_paciente:    number  — obtenido o creado en paso anterior
//       id_profesional: number  — ID real del profesional en Dentalink
//       id_sucursal:    number  — ID real de Allskin-Alpes en Dentalink
//       id_sillon:      number  — ID del box/sillón (verificar con la clínica)
//       id_atencion:    number  — ID de la prestación en Dentalink
//       fecha:          string  — "YYYY-MM-DD"
//       hora_inicio:    string  — "HH:MM" (o "HH:MM:SS" según versión de API)
//       duracion:       number  — minutos (debe ser compatible con agenda del profesional)
//       estado:         string  — "pendiente" para nueva solicitud (confirmar con Dentalink)
//   - Campos OPCIONALES:
//       notas:          string  — motivo de consulta u observaciones
//       id_bloque:      number  — ID del bloque de agenda si se reserva uno específico

export interface DentalinkCita {
  id:            number
  id_paciente:   number
  id_profesional: number
  id_sucursal:   number
  id_sillon:     number
  id_atencion:   number
  id_bloque?:    number
  fecha:         string   // "YYYY-MM-DD"
  hora_inicio:   string   // "HH:MM:SS"
  hora_fin:      string   // "HH:MM:SS"
  estado:        DentalinkEstadoCita
  notas?:        string
  creado_en:     string   // ISO 8601
}

export type DentalinkEstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'en_atencion'
  | 'completada'
  | 'cancelada'
  | 'no_asistio'

export interface DentalinkCreateCitaPayload {
  id_paciente:    number   // TODO: obtener/crear antes de llamar
  id_profesional: number   // TODO: mapear desde profesional seleccionado
  id_sucursal:    number   // TODO: constante configurada para Allskin-Alpes
  id_sillon:      number   // TODO: consultar sillones disponibles o usar fijo
  id_atencion:    number   // TODO: mapear desde prestación seleccionada
  fecha:          string
  hora_inicio:    string
  duracion:       number   // TODO: verificar compatibilidad con agenda del profesional
  estado:         DentalinkEstadoCita  // "pendiente" por defecto
  notas?:         string
  id_bloque?:     number
}

// ─── INTERFAZ DE SERVICIO ─────────────────────────────────────────────────────
//
// Contrato que implementan tanto el servicio mock como el servicio real.
// Cuando se conecte Dentalink, se crea DentalinkRealService implementando esta interfaz
// y se intercambia en src/services/dentalink/index.ts sin tocar ningún componente.

export interface IDentalinkService {
  /** Retorna la sucursal configurada (Allskin-Alpes) */
  getSucursal(): Promise<Sucursal>

  /** Lista todas las prestaciones activas */
  getPrestaciones(): Promise<Prestacion[]>

  /** Profesionales activos de la sucursal que atienden una prestación específica */
  getProfesionalesByPrestacion(prestacionId: string): Promise<Profesional[]>

  /** Fechas con al menos un slot disponible para un profesional */
  getFechasDisponibles(profesionalId: string): Promise<string[]>

  /** Slots (disponibles y ocupados) de un profesional, opcionalmente filtrados por fecha */
  getSlots(profesionalId: string, fecha?: string): Promise<Slot[]>

  /**
   * Busca un paciente por RUT en Dentalink.
   * Retorna el paciente si existe, null si no está registrado.
   * Real: GET /pacientes?rut={rut}
   */
  buscarPaciente(rut: string): Promise<Paciente | null>

  /**
   * Crea una reserva.
   * Mock: retorna objeto local sin fetch.
   * Real: requiere búsqueda/creación de paciente + POST /citas a Dentalink.
   */
  crearReserva(input: CreateReservaInput): Promise<Reserva>
}

export interface CreateReservaInput {
  paciente:     Paciente
  prestacionId: string
  profesionalId: string
  slot:         Slot
}
