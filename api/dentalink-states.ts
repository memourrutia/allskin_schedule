// GET /api/dentalink-states
// Lista los estados posibles de una cita en Dentalink. Solo lectura.

import type { VercelRequest, VercelResponse } from '@vercel/node'

const TOKEN    = process.env.DENTALINK_API_TOKEN
const BASE_URL = process.env.DENTALINK_BASE_URL ?? 'https://api.dentalink.healthatom.com/api/v1'

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Método no permitido' })
  }

  if (!TOKEN) {
    return res.status(500).json({ ok: false, message: 'DENTALINK_API_TOKEN no configurado' })
  }

  try {
    const response = await fetch(`${BASE_URL}/citas/estados`, {
      method:  'GET',
      headers: {
        'Authorization': `Token ${TOKEN}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return res.status(response.status).json({
        ok:             false,
        error:          `Dentalink respondió con status ${response.status}`,
        dentalink_body: errorBody,
      })
    }

    const body = await response.json() as { data?: unknown[] | unknown }
    const raw  = Array.isArray(body.data) ? body.data : body.data ? [body.data] : []

    return res.status(200).json({ ok: true, estados: raw, count: raw.length })

  } catch (err) {
    console.error('[dentalink-states] Error:', err instanceof Error ? err.message : err)
    return res.status(502).json({ ok: false, error: 'Error de conexión con Dentalink' })
  }
}
