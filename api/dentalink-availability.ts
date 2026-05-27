// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK AVAILABILITY — Vercel Serverless Function
// GET /api/dentalink-availability
// ─────────────────────────────────────────────────────────────────────────────
//
// Consulta los horarios disponibles en Dentalink para una fecha y profesional.
// El frontend llama a este endpoint; este endpoint llama a Dentalink con el token
// que solo existe en el servidor — el navegador nunca ve el token.
//
// Parámetros de query:
//   fecha        YYYY-MM-DD  (requerido)
//   id_dentista  number      (opcional — usa DENTALINK_DEFAULT_DENTIST_ID si se omite)
//   duracion     number      (opcional — usa DENTALINK_DEFAULT_DURATION_MINUTES si se omite)
//
// Respuesta exitosa:
//   { ok: true, slots: [...], fecha, id_dentista, duracion }
//
// ─────────────────────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node'

// ─── Variables de entorno del servidor ───────────────────────────────────────

const TOKEN              = process.env.DENTALINK_API_TOKEN
const CLIENT_ID          = process.env.DENTALINK_CLIENT_ID
const BASE_URL           = process.env.DENTALINK_BASE_URL ?? 'https://api.dentalink.healthatom.com/api/v1'
const BRANCH_ID          = process.env.DENTALINK_BRANCH_ID_ALLSKIN_ALPES
const DEFAULT_DENTIST_ID = process.env.DENTALINK_DEFAULT_DENTIST_ID
const DEFAULT_DURATION   = parseInt(process.env.DENTALINK_DEFAULT_DURATION_MINUTES ?? '30', 10)

// ─── Tipos de respuesta de Dentalink ──────────────────────────────────────────

interface DentalinkSlot {
  hora_inicio:     string   // "HH:MM" o "HH:MM:SS"
  hora_fin:        string
  id_paciente?:    number   // 0 = libre, >0 = ocupado
  nombre_paciente?: string
  id_dentista?:    number
  nombre?:         string
  duracion?:       number
  fecha?:          string   // DD/MM/YYYY
  [key: string]: unknown
}

interface DentalinkAgendaResponse {
  data?: DentalinkSlot[]
  links?: unknown
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s + 'T12:00:00')
  return !isNaN(d.getTime())
}

function isFutureDate(s: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(s + 'T12:00:00') >= today
}

/** Trunca "HH:MM:SS" → "HH:MM" para normalizar el formato */
function truncarHora(h: string): string {
  return h.slice(0, 5)
}

// ─── Handler principal ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // Solo GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  // ── 1. Validar variables de entorno ──────────────────────────────────────
  if (!TOKEN) {
    return res.status(500).json({
      ok:    false,
      error: 'DENTALINK_API_TOKEN no configurado en el servidor',
    })
  }

  if (!BRANCH_ID) {
    return res.status(500).json({
      ok:    false,
      error: 'DENTALINK_BRANCH_ID_ALLSKIN_ALPES no configurado en el servidor',
    })
  }

  // ── 2. Validar parámetros de la request ──────────────────────────────────
  const { fecha, id_dentista, duracion } = req.query

  if (!fecha || typeof fecha !== 'string') {
    return res.status(400).json({
      ok:    false,
      error: 'Parámetro requerido: fecha (YYYY-MM-DD)',
    })
  }

  if (!isValidDate(fecha)) {
    return res.status(400).json({
      ok:    false,
      error: `Fecha inválida: "${fecha}". Formato esperado: YYYY-MM-DD`,
    })
  }

  if (!isFutureDate(fecha)) {
    return res.status(400).json({
      ok:    false,
      error: 'La fecha debe ser hoy o una fecha futura',
    })
  }

  const idDentista = id_dentista
    ? String(id_dentista)
    : DEFAULT_DENTIST_ID

  const duracionMinutos = duracion
    ? parseInt(String(duracion), 10)
    : DEFAULT_DURATION

  if (isNaN(duracionMinutos) || duracionMinutos <= 0) {
    return res.status(400).json({
      ok:    false,
      error: 'duracion debe ser un número positivo (en minutos)',
    })
  }

  const { mode } = req.query

  // ── Convertir YYYY-MM-DD → DD/MM/YYYY (formato interno de Dentalink) ─────
  const [anio, mes, dia] = fecha.split('-')
  const fechaDentalink   = `${dia}/${mes}/${anio}`

  // ── Construir filtros — sin filtro de fecha, se filtra client-side ────────
  // Dentalink no filtra bien por fecha exacta en /agendas con q=
  // Pedimos todos los slots del profesional y filtramos por fecha localmente
  const filtros: Record<string, unknown> = {
    id_sucursal: { eq: parseInt(BRANCH_ID, 10) },
  }
  if (idDentista) filtros['id_dentista'] = { eq: parseInt(idDentista, 10) }

  const endpoint = `/agendas?q=${encodeURIComponent(JSON.stringify(filtros))}`

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Token ${TOKEN}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[dentalink-availability] ${response.status}:`, errorBody)
      return res.status(response.status).json({
        ok: false, error: `Dentalink respondió con status ${response.status}`, dentalink_body: errorBody,
      })
    }

    const body     = await response.json() as DentalinkAgendaResponse
    const rawSlots = body.data ?? []

    // Solo slots libres (sin paciente asignado)
    const libres = rawSlots.filter(s => !s.id_paciente || s.id_paciente === 0)

    // ── MODO DATES: extraer fechas únicas de los slots libres ───────────────
    // Dentalink devuelve slots con campo "fecha" (DD/MM/YYYY) en la consulta
    // sin filtro de fecha. Convertimos y retornamos solo las fechas futuras.
    if (mode === 'dates') {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const fechasSet = new Set<string>()
      for (const s of libres) {
        if (!s.fecha || typeof s.fecha !== 'string') continue
        const [d, m, a] = s.fecha.split('/')
        if (!d || !m || !a) continue
        const iso = `${a}-${m}-${d}`
        if (new Date(iso + 'T12:00:00') > hoy) fechasSet.add(iso)
      }

      const fechas = [...fechasSet].sort()
      return res.status(200).json({ ok: true, fechas, count: fechas.length })
    }

    // ── MODO NORMAL: devolver slots para la fecha solicitada ────────────────
    const slots = libres
      .filter(s => !s.fecha || s.fecha === fechaDentalink)
      .map(s => ({
        ...s,
        hora_inicio: truncarHora(s.hora_inicio),
        hora_fin:    truncarHora(s.hora_fin),
      }))

    return res.status(200).json({
      ok: true, slots, count: slots.length, fecha, id_dentista: idDentista ?? null, duracion: duracionMinutos,
    })

  } catch (err) {
    console.error('[dentalink-availability] Error de red:', err instanceof Error ? err.message : err)
    return res.status(502).json({ ok: false, error: 'No se pudo conectar con Dentalink' })
  }
}
