// ─────────────────────────────────────────────────────────────────────────────
// DENTALINK SERVICE — PUNTO DE ENTRADA
// ─────────────────────────────────────────────────────────────────────────────
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  ESTADO ACTUAL: dentalinkApiService  (conectado vía Vercel Functions)    │
// │  Frontend → /api/dentalink-* → Dentalink (token solo en servidor)        │
// └──────────────────────────────────────────────────────────────────────────┘

// ← ACTIVO: llama a nuestros propios endpoints /api/* en Vercel
export { dentalinkApiService as dentalinkService } from './dentalinkApiService'

// ← MOCK: solo datos locales, sin conexión
// export { mockDentalinkService as dentalinkService } from './dentalink.mockService'

// ← PLACEHOLDER real directo a Dentalink (no usar — requiere token en frontend)
// export { realDentalinkService as dentalinkService } from './dentalink.realService.placeholder'

export type { IDentalinkService, CreateReservaInput } from './dentalink.types'
