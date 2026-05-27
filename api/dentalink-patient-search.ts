// GET /api/dentalink-patient-search?rut={rut}
// Busca un paciente en Dentalink por RUT. Solo lectura, no crea nada.

import type { VercelRequest, VercelResponse } from '@vercel/node'

const TOKEN    = process.env.DENTALINK_API_TOKEN
const BASE_URL = process.env.DENTALINK_BASE_URL ?? 'https://api.dentalink.healthatom.com/api/v1'

interface DentalinkPaciente {
  id:        number
  nombre?:   string
  apellidos?: string
  apellido?:  string
  rut?:       string
  email?:     string
  telefono?:  string
  celular?:   string
  [key: string]: unknown
}

interface DentalinkResponse {
  data?: DentalinkPaciente[] | DentalinkPaciente
}

/**
 * Normaliza RUT al formato que usa Dentalink: sin puntos, con guión, mayúsculas.
 * Ej: "15.643.450-7" → "15643450-7"
 *     "156434507"    → "15643450-7" (recompone el guión)
 */
function normalizarRut(rut: string): string {
  const limpio = rut.replace(/\./g, '').trim().toUpperCase()
  // Si ya tiene guión lo dejamos; si no, lo recomponemos
  if (limpio.includes('-')) return limpio
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Método no permitido' })
  }

  if (!TOKEN) {
    return res.status(500).json({ ok: false, message: 'DENTALINK_API_TOKEN no configurado' })
  }

  const { rut } = req.query
  if (!rut || typeof rut !== 'string') {
    return res.status(400).json({ ok: false, message: 'Parámetro rut requerido' })
  }

  const rutNorm = normalizarRut(rut)

  try {
    // Dentalink usa formato q JSON para filtros
    const filtro = JSON.stringify({ rut: { eq: rutNorm } })
    const url    = `${BASE_URL}/pacientes?q=${encodeURIComponent(filtro)}`

    const response = await fetch(url, {
      method:  'GET',
      headers: {
        'Authorization': `Token ${TOKEN}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[dentalink-patient-search] ${response.status}:`, errorBody)
      return res.status(response.status).json({
        ok:    false,
        found: false,
        error: `Dentalink respondió con status ${response.status}`,
      })
    }

    const body = await response.json() as DentalinkResponse
    const raw  = Array.isArray(body.data) ? body.data : body.data ? [body.data] : []

    if (raw.length === 0) {
      return res.status(200).json({ ok: true, found: false, paciente: null })
    }

    const p = raw[0]

    // Respuesta sanitizada — nunca devolver id_dentalink ni datos internos sensibles
    return res.status(200).json({
      ok:    true,
      found: true,
      paciente: {
        nombre:   p.nombre  ?? '',
        apellido: p.apellidos ?? p.apellido ?? '',
        rut:      p.rut    ?? rut,
        email:    p.email  ?? '',
        telefono: p.celular ?? p.telefono ?? '',
      },
    })

  } catch (err) {
    console.error('[dentalink-patient-search] Error:', err instanceof Error ? err.message : err)
    return res.status(502).json({ ok: false, found: false, error: 'Error de conexión con Dentalink' })
  }
}
