// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK BRANCHES — Vercel Serverless Function
// GET /api/dentalink-branches
// ─────────────────────────────────────────────────────────────────────────────
//
// Consulta la lista de sucursales registradas en Dentalink.
// Úsalo para descubrir el ID real de la sucursal Allskin-Alpes antes de
// configurar DENTALINK_BRANCH_ID_ALLSKIN_ALPES en las variables de entorno.
//
// Solo lectura. No modifica nada en Dentalink.
// El token nunca sale del servidor ni aparece en la respuesta.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node'

const TOKEN      = process.env.DENTALINK_API_TOKEN
const CLIENT_ID  = process.env.DENTALINK_CLIENT_ID
const BASE_URL   = process.env.DENTALINK_BASE_URL ?? 'https://api.dentalink.healthatom.com/api/v1'

// Shape esperada de cada sucursal en la respuesta de Dentalink
interface DentalinkBranch {
  id:        number | string
  nombre?:   string
  name?:     string
  direccion?: string
  address?:   string
  activo?:   boolean
  active?:   boolean
  habilitado?: boolean
  [key: string]: unknown
}

interface DentalinkResponse {
  data?: DentalinkBranch[] | DentalinkBranch
}

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // Solo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Método no permitido' })
  }

  // Verificar variables de entorno sin revelarlas
  if (!TOKEN) {
    return res.status(500).json({
      ok:      false,
      message: 'DENTALINK_API_TOKEN no configurado en el servidor',
    })
  }


  // ── Consulta a Dentalink ────────────────────────────────────────────────
  let raw: DentalinkBranch[] = []

  try {
    const response = await fetch(`${BASE_URL}/sucursales`, {
      method:  'GET',
      headers: {
        'Authorization': `Token ${TOKEN}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    })

    if (!response.ok) {
      // Leer el cuerpo del error para el log interno (no se envía al cliente)
      const errorBody = await response.text()
      console.error(`[dentalink-branches] Dentalink ${response.status}:`, errorBody)

      return res.status(response.status).json({
        ok:      false,
        message: 'No se pudo obtener la lista de sucursales',
        error:   `Dentalink respondió con status ${response.status}`,
      })
    }

    const body = await response.json() as DentalinkResponse

    // Normalizar: data puede ser array o un objeto único según la versión de la API
    if (Array.isArray(body.data)) {
      raw = body.data
    } else if (body.data && typeof body.data === 'object') {
      raw = [body.data]
    }

  } catch (err) {
    console.error('[dentalink-branches] Error de red:', err instanceof Error ? err.message : err)
    return res.status(502).json({
      ok:      false,
      message: 'No se pudo obtener la lista de sucursales',
      error:   'Error de conexión con Dentalink',
    })
  }

  // ── Mapear a la forma pública (sin datos internos ni credenciales) ───────
  const branches = raw.map(b => ({
    id:      String(b.id),
    name:    b.nombre ?? b.name ?? '(sin nombre)',
    address: b.direccion ?? b.address ?? null,
    active:  b.activo ?? b.active ?? b.habilitado ?? true,
  }))

  return res.status(200).json({
    ok:       true,
    branches,
    count:    branches.length,
  })
}
