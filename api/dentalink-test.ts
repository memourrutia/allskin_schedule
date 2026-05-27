// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK TEST — Vercel Serverless Function
// GET /api/dentalink-test
// ─────────────────────────────────────────────────────────────────────────────
//
// Propósito: verificar que el token y la conexión con Dentalink funcionan
//            correctamente, sin exponer datos sensibles al frontend.
//
// Uso: GET /api/dentalink-test
// Respuesta segura: nunca devuelve el token ni datos internos de la clínica.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node'

// ─── Variables de entorno del servidor ───────────────────────────────────────
// Estas variables NUNCA llegan al navegador ni al bundle de Vite.
// Se configuran en: Vercel Dashboard → Settings → Environment Variables

const TOKEN     = process.env.DENTALINK_API_TOKEN
const CLIENT_ID = process.env.DENTALINK_CLIENT_ID
const BASE_URL  = process.env.DENTALINK_BASE_URL ?? 'https://api.dentalink.healthatom.com/api/v1'

// ─── Helper: llamada autenticada a Dentalink ──────────────────────────────────

async function dentalinkGet(endpoint: string): Promise<Response> {
  return fetch(`${BASE_URL}${endpoint}`, {
    method:  'GET',
    headers: {
      'Authorization': `Token ${TOKEN}`,
      'Content-Type':  'application/json',
      'Accept':        'application/json',
    },
  })
}

// ─── Handler principal ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // Solo GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  // ── 1. Verificar variables de entorno ────────────────────────────────────
  const envStatus = {
    DENTALINK_API_TOKEN:                   !!process.env.DENTALINK_API_TOKEN,
    DENTALINK_CLIENT_ID:                   !!process.env.DENTALINK_CLIENT_ID,
    DENTALINK_BASE_URL:                    !!process.env.DENTALINK_BASE_URL,
    DENTALINK_BRANCH_ID_ALLSKIN_ALPES:    !!process.env.DENTALINK_BRANCH_ID_ALLSKIN_ALPES,
    DENTALINK_DEFAULT_DENTIST_ID:          !!process.env.DENTALINK_DEFAULT_DENTIST_ID,
    DENTALINK_DEFAULT_CHAIR_ID:            !!process.env.DENTALINK_DEFAULT_CHAIR_ID,
    DENTALINK_DEFAULT_APPOINTMENT_STATUS_ID: !!process.env.DENTALINK_DEFAULT_APPOINTMENT_STATUS_ID,
    DENTALINK_DEFAULT_DURATION_MINUTES:    !!process.env.DENTALINK_DEFAULT_DURATION_MINUTES,
  }

  const missingVars = Object.entries(envStatus)
    .filter(([, ok]) => !ok)
    .map(([name]) => name)

  if (!TOKEN) {
    return res.status(500).json({
      ok:    false,
      error: 'DENTALINK_API_TOKEN no está configurado en Vercel Environment Variables',
      env:   envStatus,
    })
  }

  // ── 2. Llamada de prueba a Dentalink ─────────────────────────────────────
  let dentalinkOk   = false
  let dentalinkStatus: number | null = null
  let sucursalesCount = 0

  try {
    const response = await dentalinkGet('/sucursales')
    dentalinkStatus = response.status

    if (response.ok) {
      const body = await response.json() as { data?: unknown[] }
      sucursalesCount = Array.isArray(body.data) ? body.data.length : 0
      dentalinkOk    = true
    }
  } catch (err) {
    // La conexión falló — se registra sin exponer detalles al cliente
    console.error('[dentalink-test] Error al conectar:', err instanceof Error ? err.message : err)
  }

  // ── 3. Respuesta segura ───────────────────────────────────────────────────
  // Nunca se devuelve el token ni datos internos de Dentalink
  return res.status(dentalinkOk ? 200 : 502).json({
    ok:               dentalinkOk,
    message:          dentalinkOk
      ? '✓ Conexión con Dentalink exitosa'
      : '✗ No se pudo conectar con Dentalink',
    dentalink_status: dentalinkStatus,
    sucursales_count: sucursalesCount,
    env_configured:   envStatus,
    missing_vars:     missingVars,
    base_url:         BASE_URL,        // URL no es sensible
    timestamp:        new Date().toISOString(),
  })
}
