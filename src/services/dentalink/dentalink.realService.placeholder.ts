// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK — REAL SERVICE PLACEHOLDER  ← NO ACTIVO / NO EJECUTAR
// ─────────────────────────────────────────────────────────────────────────────
//
// ⚠️  ESTE ARCHIVO NO ESTÁ CONECTADO A NADA.
// ⚠️  NINGUNA FUNCIÓN AQUÍ HACE LLAMADAS HTTP REALES.
// ⚠️  NO IMPORTAR ESTE MÓDULO EN PRODUCCIÓN HASTA COMPLETAR TODOS LOS TODO.
//
// Propósito: documentar los pasos exactos de la integración real con Dentalink
//            y dejar el esqueleto listo para implementar sin tocar componentes.
//
// Para activar este servicio cuando esté listo:
//   → Editar src/services/dentalink/index.ts (ver instrucciones allí).
//
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { IDentalinkService, CreateReservaInput } from './dentalink.types'
import type { Sucursal, Prestacion, Profesional, Slot, Reserva, Paciente } from '../../types/booking'

// ─── CONFIGURACIÓN (pendiente) ────────────────────────────────────────────────
//
// TODO: definir las siguientes variables de entorno en el BACKEND/PROXY:
//
//   DENTALINK_API_TOKEN       Token de autenticación de Dentalink
//                             → Configuración → API en el panel de Dentalink
//                             → NUNCA incluir en el frontend (variable solo de servidor)
//
//   DENTALINK_BASE_URL        URL base de la API
//                             → Probable: https://app.dentalink.cl/api/v1
//
//   DENTALINK_SUCURSAL_ID     ID numérico real de la sucursal Allskin-Alpes
//                             → Consultar GET /sucursales al conectar
//
//   DENTALINK_SILLON_ID       ID numérico del sillón/box de la sucursal
//                             → Consultar GET /sucursales/{id}/sillones
//                             → Si hay un solo sillón, usar ese ID siempre
//
// IMPORTANTE — Seguridad:
//   El token NO debe exponerse en el frontend (Vite client).
//   La comunicación con Dentalink debe ir a través de un backend/proxy propio
//   (ej: función Edge, Next.js API route, Express, etc.) que recibe la petición
//   del frontend y la reenvía a Dentalink con el token en el servidor.

// Constantes de configuración — pendientes de valores reales
// const DENTALINK_BASE_URL    = 'https://app.dentalink.cl/api/v1'  // TODO: confirmar con Dentalink
// const DENTALINK_SUCURSAL_ID = 0  // TODO: ID real de Allskin-Alpes
// const DENTALINK_SILLON_ID   = 0  // TODO: ID real del sillón

// ─── HELPER HTTP (esqueleto) ──────────────────────────────────────────────────
//
// TODO: este helper debe vivir en el BACKEND, no aquí.
//       Está definido solo como referencia de cómo se llamaría a la API.
//
// function dentalinkFetch<T>(
//   endpoint: string,
//   options?: RequestInit,
// ): Promise<T> {
//   // El token debe venir del servidor, nunca del frontend
//   const token = process.env.DENTALINK_API_TOKEN
//   return fetch(`${DENTALINK_BASE_URL}${endpoint}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Token ${token}`,
//       ...options?.headers,
//     },
//   }).then(r => r.json())
// }

// ─── IMPLEMENTACIÓN REAL (ESQUELETO) ─────────────────────────────────────────

export const realDentalinkService: IDentalinkService = {

  // ── getSucursal ─────────────────────────────────────────────────────────────
  //
  // TODO:
  //   1. GET /sucursales
  //   2. Encontrar la que corresponde a Allskin-Alpes (por nombre o ID configurado)
  //   3. Mapear con mapSucursal() de dentalink.mapper.ts
  //   4. Guardar el ID real en DENTALINK_SUCURSAL_ID
  //
  async getSucursal(): Promise<Sucursal> {
    throw new Error(
      '[realDentalinkService] getSucursal() no implementado. ' +
      'Requiere: DENTALINK_SUCURSAL_ID configurado.'
    )
  },

  // ── getPrestaciones ─────────────────────────────────────────────────────────
  //
  // TODO:
  //   1. GET /atenciones (o el endpoint equivalente — verificar documentación)
  //   2. Filtrar solo las atenciones activas
  //   3. Mapear con mapPrestacion() de dentalink.mapper.ts
  //   4. Las descripciones deberán completarse manualmente (Dentalink no las devuelve)
  //
  async getPrestaciones(): Promise<Prestacion[]> {
    throw new Error(
      '[realDentalinkService] getPrestaciones() no implementado. ' +
      'Requiere: confirmar endpoint /atenciones con Dentalink.'
    )
  },

  // ── getProfesionalesByPrestacion ─────────────────────────────────────────────
  //
  // TODO:
  //   1. GET /profesionales?id_sucursal={DENTALINK_SUCURSAL_ID}
  //   2. Mapear con mapProfesional() de dentalink.mapper.ts
  //   3. Filtrar por prestacionId (la relación profesional-prestación puede no
  //      existir en la API → mantener configuración local en mockDentalink.ts
  //      y cruzar con los IDs reales obtenidos)
  //
  async getProfesionalesByPrestacion(_prestacionId: string): Promise<Profesional[]> {
    throw new Error(
      '[realDentalinkService] getProfesionalesByPrestacion() no implementado. ' +
      'Requiere: id_sucursal real + mapeo profesional↔prestación.'
    )
  },

  // ── getFechasDisponibles ─────────────────────────────────────────────────────
  //
  // TODO:
  //   1. GET /agenda?id_profesional={id}&id_sucursal={id}&fecha_inicio={hoy}&fecha_fin={hoy+14d}
  //   2. Filtrar bloques con estado === 'libre'
  //   3. Extraer fechas únicas
  //   4. Retornar las primeras 7
  //
  async getFechasDisponibles(_profesionalId: string): Promise<string[]> {
    throw new Error(
      '[realDentalinkService] getFechasDisponibles() no implementado. ' +
      'Requiere: id_profesional real de Dentalink + endpoint /agenda.'
    )
  },

  // ── getSlots ─────────────────────────────────────────────────────────────────
  //
  // TODO:
  //   1. GET /agenda?id_profesional={id}&id_sucursal={id}&fecha={YYYY-MM-DD}
  //   2. Mapear cada DentalinkBloqueAgenda con mapSlot() de dentalink.mapper.ts
  //   3. hora_inicio en Dentalink viene como "HH:MM:SS" — mapSlot trunca a "HH:MM"
  //
  async getSlots(_profesionalId: string, _fecha?: string): Promise<Slot[]> {
    throw new Error(
      '[realDentalinkService] getSlots() no implementado. ' +
      'Requiere: id_profesional real + endpoint /agenda.'
    )
  },

  // ── buscarPaciente ────────────────────────────────────────────────────────────
  //
  // TODO:
  //   1. GET /pacientes?rut={rut_normalizado}
  //   2. Si la API retorna 404 o lista vacía → retornar null (paciente nuevo)
  //   3. Si retorna resultados → mapear con mapPacienteDentalink()
  //   Nota: normalizar el RUT antes de enviarlo (sin puntos, con o sin guión)
  //
  async buscarPaciente(_rut: string): Promise<Paciente | null> {
    throw new Error(
      '[realDentalinkService] buscarPaciente() no implementado. ' +
      'Requiere: GET /pacientes?rut={rut} + manejo de 404.'
    )
  },

  // ── crearReserva ─────────────────────────────────────────────────────────────
  //
  // Este es el endpoint más complejo. Requiere múltiples pasos:
  //
  // PASO 1 — Buscar o crear el paciente en Dentalink:
  //   a. GET /pacientes?rut={rut_del_formulario}
  //   b. Si existe → usar su id_paciente
  //   c. Si no existe → POST /pacientes con { nombre, apellido, rut, email, telefono }
  //                  → guardar el id_paciente retornado
  //   Nota: Dentalink puede requerir que el RUT esté normalizado (sin puntos/guión)
  //
  // PASO 2 — Obtener el id_atencion (prestación) de Dentalink:
  //   - Usar el id_dentalink de la prestación seleccionada (MOCK_PRESTACIONES[x].id_dentalink)
  //   - TODO: estos IDs son null ahora; se llenarán al mapear con la API real
  //
  // PASO 3 — Obtener el id_profesional de Dentalink:
  //   - Usar profesional.id_dentalink del profesional seleccionado
  //   - TODO: ídem anterior
  //
  // PASO 4 — Crear la cita:
  //   POST /citas con payload DentalinkCreateCitaPayload:
  //   {
  //     id_paciente:    <obtenido en paso 1>,
  //     id_profesional: <profesional.id_dentalink>,
  //     id_sucursal:    DENTALINK_SUCURSAL_ID,
  //     id_sillon:      DENTALINK_SILLON_ID,
  //     id_atencion:    <prestacion.id_dentalink>,
  //     fecha:          slot.fecha,           // "YYYY-MM-DD"
  //     hora_inicio:    slot.hora_inicio,     // "HH:MM"
  //     duracion:       prestacion.duracion_minutos,
  //     estado:         "pendiente",
  //     notas:          paciente.motivo ?? "",
  //     id_bloque:      slot.id_dentalink ?? undefined,
  //   }
  //
  // PASO 5 — Mapear respuesta:
  //   - mapCitaToReserva(citaCreada, paciente, numero_referencia)
  //   - El numero_referencia puede generarse localmente o venir de Dentalink
  //
  // MANEJO DE ERRORES:
  //   - 401 Unauthorized → token inválido o expirado
  //   - 422 Unprocessable → datos inválidos (RUT, fechas, IDs)
  //   - 409 Conflict → el slot ya fue tomado por otro paciente (race condition)
  //   - Implementar retry solo para 5xx (errores de servidor)
  //
  async crearReserva(_input: CreateReservaInput): Promise<Reserva> {
    throw new Error(
      '[realDentalinkService] crearReserva() no implementado. ' +
      'Requiere: buscar/crear paciente en Dentalink + POST /citas con todos los IDs reales. ' +
      'Ver comentarios en este método para el flujo completo.'
    )
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST DE INTEGRACIÓN — completar antes de activar este servicio
// ─────────────────────────────────────────────────────────────────────────────
//
// [ ] Obtener acceso a la API de Dentalink (token de partner/cliente)
// [ ] Confirmar URL base de la API (https://app.dentalink.cl/api/v1 o similar)
// [ ] Crear backend/proxy para no exponer el token en el frontend
// [ ] GET /sucursales → obtener id_sucursal real de Allskin-Alpes
// [ ] GET /sucursales/{id}/sillones → obtener id_sillon (box dental)
// [ ] GET /profesionales?id_sucursal={id} → mapear IDs reales a profesionales mock
// [ ] GET /atenciones → mapear IDs reales a prestaciones mock
// [ ] Verificar endpoint de agenda (GET /agenda o similar)
// [ ] Implementar flujo buscar/crear paciente por RUT
// [ ] Verificar formato de RUT que acepta Dentalink (con/sin puntos y guión)
// [ ] Confirmar estado inicial de una cita nueva ("pendiente" vs "confirmada")
// [ ] Confirmar si id_bloque es requerido u opcional al crear la cita
// [ ] Implementar manejo de errores (401, 422, 409, 5xx)
// [ ] Actualizar id_dentalink de MOCK_SUCURSAL, MOCK_PROFESIONALES, MOCK_PRESTACIONES
// [ ] Cambiar export activo en index.ts de mockDentalinkService a realDentalinkService
// [ ] Probar flujo completo en ambiente de staging de Dentalink antes de producción
//
// ─────────────────────────────────────────────────────────────────────────────
