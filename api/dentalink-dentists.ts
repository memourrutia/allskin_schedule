// GET /api/dentalink-dentists
// Lista los profesionales de la sucursal configurada. Solo lectura.

import type { VercelRequest, VercelResponse } from '@vercel/node'

const TOKEN     = process.env.DENTALINK_API_TOKEN
const BASE_URL  = process.env.DENTALINK_BASE_URL ?? 'https://api.dentalink.healthatom.com/api/v1'
const BRANCH_ID = process.env.DENTALINK_BRANCH_ID_ALLSKIN_ALPES

// Solo estas 3 doctoras atienden en la agenda online de Allskin-Alpes
const ALLOWED_DENTIST_IDS = new Set([1205326403, 1205326404, 1205326405])

interface DentalinkDentist {
  id:            number | string
  nombre?:       string
  apellidos?:    string
  especialidad?: string
  agenda_online?: number | boolean
  habilitado?:   number | boolean  // campo real de Dentalink para estado activo
  intervalo?:    number
  [key: string]: unknown
}

interface DentalinkResponse {
  data?: DentalinkDentist[] | DentalinkDentist
}

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Método no permitido' })
  }

  if (!TOKEN) {
    return res.status(500).json({ ok: false, message: 'DENTALINK_API_TOKEN no configurado' })
  }

  if (!BRANCH_ID) {
    return res.status(500).json({ ok: false, message: 'DENTALINK_BRANCH_ID_ALLSKIN_ALPES no configurado' })
  }

  try {
    const filtros = { id_sucursal: { eq: parseInt(BRANCH_ID!, 10) } }
    const response = await fetch(`${BASE_URL}/dentistas?q=${encodeURIComponent(JSON.stringify(filtros))}`, {
      method:  'GET',
      headers: {
        'Authorization': `Token ${TOKEN}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[dentalink-dentists] Dentalink ${response.status}:`, errorBody)
      return res.status(response.status).json({
        ok:          false,
        error:       `Dentalink respondió con status ${response.status}`,
        dentalink_body: errorBody,   // visible para diagnóstico
      })
    }

    const body = await response.json() as DentalinkResponse
    const raw  = Array.isArray(body.data) ? body.data : body.data ? [body.data] : []

    // Dentalink usa "habilitado" (no "activo") para indicar si el profesional está activo
    const isTrue = (v: unknown) => v === 1 || v === true || v === '1'

    const dentists = raw
      .filter(d => isTrue(d.agenda_online) && isTrue(d.habilitado) && ALLOWED_DENTIST_IDS.has(Number(d.id)))
      .map(d => ({
        id:           String(d.id),
        name:         `${d.nombre ?? ''} ${d.apellidos ?? ''}`.trim(),
        especialidad: d.especialidad ?? null,
      }))

    return res.status(200).json({ ok: true, dentists, count: dentists.length, branch_id: BRANCH_ID })

  } catch (err) {
    console.error('[dentalink-dentists] Error:', err instanceof Error ? err.message : err)
    return res.status(502).json({ ok: false, error: 'Error de conexión con Dentalink' })
  }
}
