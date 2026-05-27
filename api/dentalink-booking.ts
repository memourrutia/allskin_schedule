// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK BOOKING — Vercel Serverless Function
// POST /api/dentalink-booking
// ─────────────────────────────────────────────────────────────────────────────
//
// Crea una cita en Dentalink a partir de los datos del formulario de agendamiento.
//
// ⚠️  DRY_RUN = true  ─────────────────────────────────────────────────────────
// El endpoint está en modo de prueba. Valida todo el payload y simula la
// respuesta exitosa, pero NO ejecuta ningún POST real hacia Dentalink.
//
// Para activar el modo real: cambiar DRY_RUN a false SOLO con autorización
// explícita del responsable del proyecto.
// ─────────────────────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node'

// ─────────────────────────────────────────────────────────────────────────────
// ✅ MODO REAL ACTIVO — migración a API de producción completada el 2026-05-25
// ─────────────────────────────────────────────────────────────────────────────
const DRY_RUN = false

// ─── Variables de entorno del servidor ───────────────────────────────────────

const TOKEN             = process.env.DENTALINK_API_TOKEN
const BASE_URL          = process.env.DENTALINK_BASE_URL ?? 'https://api.dentalink.healthatom.com/api/v1'
const BRANCH_ID         = process.env.DENTALINK_BRANCH_ID_ALLSKIN_ALPES
const DEFAULT_CHAIR     = process.env.DENTALINK_DEFAULT_CHAIR_ID
const DEFAULT_STATUS    = process.env.DENTALINK_DEFAULT_APPOINTMENT_STATUS_ID
const DEFAULT_DURATION  = parseInt(process.env.DENTALINK_DEFAULT_DURATION_MINUTES ?? '30', 10)

// Solo estas 3 doctoras atienden en la agenda online de Allskin-Alpes
const ALLOWED_DENTIST_IDS = new Set([1205326403, 1205326404, 1205326405])

// ─── Tipos del payload entrante ───────────────────────────────────────────────

interface BookingPayload {
  paciente: {
    nombre:   string
    apellido: string
    rut:      string
    email:    string
    telefono: string
    motivo?:  string
  }
  prestacion_id:  string
  profesional_id: string
  fecha:          string   // YYYY-MM-DD
  hora_inicio:    string   // HH:MM
  duracion?:      number
}

interface ValidationResult {
  ok:     boolean
  errors: string[]
}

// ─── Validaciones ─────────────────────────────────────────────────────────────

/** Verifica el dígito verificador del RUT chileno */
function validarRut(rut: string): boolean {
  const limpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim()
  if (limpio.length < 2) return false

  const cuerpo = limpio.slice(0, -1)
  const dv     = limpio.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false

  let suma    = 0
  let factor  = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma   += parseInt(cuerpo[i]) * factor
    factor  = factor === 7 ? 2 : factor + 1
  }

  const resto      = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dvEsperado === dv
}

function validarPayload(body: unknown): ValidationResult {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['Body de la request inválido o vacío'] }
  }

  const p = body as Partial<BookingPayload>

  // Paciente
  if (!p.paciente)                           errors.push('paciente es requerido')
  if (!p.paciente?.nombre?.trim())           errors.push('paciente.nombre es requerido')
  if (!p.paciente?.apellido?.trim())         errors.push('paciente.apellido es requerido')
  if (!p.paciente?.rut?.trim()) {
    errors.push('paciente.rut es requerido')
  } else if (!validarRut(p.paciente.rut)) {
    errors.push(`paciente.rut "${p.paciente.rut}" no es un RUT chileno válido`)
  }
  if (!p.paciente?.email?.trim()) {
    errors.push('paciente.email es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.paciente.email)) {
    errors.push('paciente.email no tiene un formato válido')
  }
  if (!p.paciente?.telefono?.trim())         errors.push('paciente.telefono es requerido')

  // Cita
  if (!p.prestacion_id)                      errors.push('prestacion_id es requerido')
  if (!p.profesional_id)                     errors.push('profesional_id es requerido')

  if (!p.fecha) {
    errors.push('fecha es requerida (YYYY-MM-DD)')
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(p.fecha)) {
    errors.push('fecha debe tener formato YYYY-MM-DD')
  } else {
    const fechaDate = new Date(p.fecha + 'T12:00:00')
    const hoy       = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (isNaN(fechaDate.getTime())) errors.push('fecha no es una fecha válida')
    else if (fechaDate < hoy)       errors.push('fecha no puede ser una fecha pasada')
  }

  if (!p.hora_inicio) {
    errors.push('hora_inicio es requerida (HH:MM)')
  } else if (!/^\d{2}:\d{2}$/.test(p.hora_inicio)) {
    errors.push('hora_inicio debe tener formato HH:MM')
  }

  return { ok: errors.length === 0, errors }
}

// ─── Helpers de Dentalink ─────────────────────────────────────────────────────

async function buscarPacientePorRut(rut: string): Promise<{ id: number } | null> {
  // Formato Dentalink: sin puntos, con guión (ej: "15643450-7")
  const sinPuntos = rut.replace(/\./g, '').trim()
  const rutNorm   = sinPuntos.includes('-') ? sinPuntos : `${sinPuntos.slice(0, -1)}-${sinPuntos.slice(-1)}`
  const url       = `${BASE_URL}/pacientes?q=${encodeURIComponent(JSON.stringify({ rut: { eq: rutNorm } }))}`

  const res = await fetch(url, {
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json' },
  })

  if (!res.ok) return null
  const body = await res.json() as { data?: Array<{ id: number }> }
  return body.data?.[0] ?? null
}

async function crearPaciente(paciente: BookingPayload['paciente']): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/pacientes`, {
    method:  'POST',
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre:    paciente.nombre,
      apellidos: paciente.apellido,
      rut:       paciente.rut,
      email:     paciente.email,
      telefono:  paciente.telefono,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error al crear paciente en Dentalink (${res.status}): ${err}`)
  }

  const body = await res.json() as { data: { id: number } }
  return body.data
}

async function crearCita(payload: {
  id_paciente:  number
  id_dentista:  number
  id_sucursal:  number
  id_recurso:   number
  id_estado:    number
  fecha:        string
  hora_inicio:  string
  duracion:     number
  observaciones?: string
}): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/citas`, {
    method:  'POST',
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error al crear cita en Dentalink (${res.status}): ${err}`)
  }

  const body = await res.json() as { data: { id: number } }
  return body.data
}

// ─── Handler principal ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // Solo POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  // ── 1. Validar variables de entorno ──────────────────────────────────────
  if (!TOKEN) {
    return res.status(500).json({
      ok:    false,
      error: 'DENTALINK_API_TOKEN no configurado en el servidor',
    })
  }

  const missingEnv = [
    !BRANCH_ID      && 'DENTALINK_BRANCH_ID_ALLSKIN_ALPES',
    !DEFAULT_CHAIR  && 'DENTALINK_DEFAULT_CHAIR_ID',
    !DEFAULT_STATUS && 'DENTALINK_DEFAULT_APPOINTMENT_STATUS_ID',
  ].filter(Boolean) as string[]

  if (missingEnv.length > 0) {
    return res.status(500).json({
      ok:          false,
      error:       'Variables de entorno del servidor incompletas',
      missing_env: missingEnv,
    })
  }

  // ── 2. Validar payload ───────────────────────────────────────────────────
  const validation = validarPayload(req.body)
  if (!validation.ok) {
    return res.status(400).json({
      ok:     false,
      error:  'Datos de la reserva inválidos',
      errors: validation.errors,
    })
  }

  const payload = req.body as BookingPayload
  const duracion = payload.duracion ?? DEFAULT_DURATION

  // ── 3. DRY-RUN: no ejecutar nada real ────────────────────────────────────
  if (DRY_RUN) {
    console.log('[dentalink-booking] DRY-RUN — payload validado:', {
      paciente:      `${payload.paciente.nombre} ${payload.paciente.apellido}`,
      rut:           payload.paciente.rut,
      prestacion_id: payload.prestacion_id,
      fecha:         payload.fecha,
      hora_inicio:   payload.hora_inicio,
      duracion,
      // El token NUNCA se loguea
    })

    // Genera un número de referencia simulado
    const refNum = `DRY-${Date.now().toString(36).toUpperCase().slice(-6)}`

    return res.status(200).json({
      ok:               true,
      dry_run:          true,
      message:          'Reserva validada en modo dry-run. No se creó ninguna cita real en Dentalink.',
      numero_referencia: refNum,
      payload_recibido: {
        paciente:      `${payload.paciente.nombre} ${payload.paciente.apellido}`,
        rut:           payload.paciente.rut,
        prestacion_id: payload.prestacion_id,
        fecha:         payload.fecha,
        hora_inicio:   payload.hora_inicio,
        duracion,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ── 4. MODO REAL (DRY_RUN = false) ───────────────────────────────────────
  // Este bloque solo se ejecuta cuando DRY_RUN = false con autorización explícita
  // ─────────────────────────────────────────────────────────────────────────

  // Validar que la doctora seleccionada esté autorizada para esta agenda
  const idDentista = parseInt(payload.profesional_id, 10)
  if (!ALLOWED_DENTIST_IDS.has(idDentista)) {
    return res.status(400).json({
      ok:    false,
      error: 'Profesional no autorizado para este agendamiento',
    })
  }

  try {
    // Paso A: Buscar o crear paciente
    let idPaciente: number
    const pacienteExistente = await buscarPacientePorRut(payload.paciente.rut)

    if (pacienteExistente) {
      idPaciente = pacienteExistente.id
    } else {
      const nuevoPaciente = await crearPaciente(payload.paciente)
      idPaciente = nuevoPaciente.id
    }

    // Paso B: Crear la cita
    const cita = await crearCita({
      id_paciente:   idPaciente,
      id_dentista:   idDentista,
      id_sucursal:   parseInt(BRANCH_ID!, 10),
      id_recurso:    parseInt(DEFAULT_CHAIR!, 10),
      id_estado:     parseInt(DEFAULT_STATUS!, 10),
      fecha:         payload.fecha,
      hora_inicio:   payload.hora_inicio,
      duracion,
      observaciones: payload.paciente.motivo,
    })

    const refNum = `ALPES-${cita.id}`

    return res.status(201).json({
      ok:               true,
      dry_run:          false,
      numero_referencia: refNum,
      id_cita_dentalink: cita.id,
      id_paciente:       idPaciente,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[dentalink-booking] Error:', message)

    return res.status(502).json({
      ok:    false,
      error: 'No se pudo completar la reserva. Intenta nuevamente o contacta a la clínica.',
    })
  }
}
