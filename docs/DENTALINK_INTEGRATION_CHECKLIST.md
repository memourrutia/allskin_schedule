# Checklist técnico de integración real con Dentalink

**Basado en:** https://api.dentalink.healthatom.com/docs/  
**Proyecto:** Agenda_Allskin — sucursal Allskin-Alpes  
**Estado:** Preparación pre-integración. Ninguna llamada activa aún.  
**Última revisión:** 2026-05-19  

---

## INSTRUCCIONES DE USO

Completar este checklist en orden antes de activar `realDentalinkService`.  
Cuando obtengas un dato, reemplaza `⬜` por `✅` y completa el valor.  
Los valores sensibles (token) **nunca** se escriben aquí — van al servidor.

---

## BLOQUE 1 — Credenciales y acceso

### 1.1 Token de API

| Item | Estado | Detalle |
|---|---|---|
| Token generado en Dentalink | ⬜ | Panel → Configuración → API → Generar token |
| Almacenado como variable de entorno del servidor | ⬜ | `DENTALINK_API_TOKEN=...` solo en el backend |
| Verificado que NO está en código fuente ni `.env` del frontend | ⬜ | |

**Cabecera requerida en cada request:**
```
Authorization: Token <api_token>
```
> ⚠️ La API opera **solo sobre HTTPS**. Toda llamada por HTTP falla.

---

### 1.2 URL base confirmada

| Item | Estado | Valor |
|---|---|---|
| URL base de la API | ⬜ | `https://api.dentalink.healthatom.com/api/v1` |

> Verificar con Dentalink si existe una URL de sandbox/staging para pruebas.

---

## BLOQUE 2 — Datos de la sucursal

### Endpoint
```
GET /sucursales
Authorization: Token <token>
```

### Campos que devuelve
- `id` — ID numérico de la sucursal ← el que necesitamos
- `nombre` — nombre de la sucursal
- Recursos relacionados: `cajas`, `citas`, `usuarios`, `horarios`

### Datos a obtener

| Item | Estado | Valor |
|---|---|---|
| `id` de sucursal Allskin-Alpes | ⬜ | — |
| Nombre exacto en Dentalink | ⬜ | — |

**Código de ejemplo (solo para referencia — no ejecutar aún):**
```
GET /sucursales?q={"nombre":{"lk":"Alpes"}}
```

**Dónde usar en el código:**
- `mockDentalink.ts` → `MOCK_SUCURSAL.id_dentalink`
- Variable de entorno del servidor: `DENTALINK_SUCURSAL_ID`

---

## BLOQUE 3 — Sillones / Recursos

### Endpoint
```
GET /sillones
Authorization: Token <token>
```

### Campos que devuelve
- `id` — ID del sillón ← requerido en POST /citas (como `id_recurso`)
- Estado y datos del recurso

> ⚠️ Al crear una cita, el campo se llama `id_recurso` (no `id_sillon`).  
> Verificar si la API v5 usa una nomenclatura diferente.

### Datos a obtener

| Item | Estado | `id` | Nombre | Sucursal |
|---|---|---|---|---|
| Sillón / recurso 1 | ⬜ | — | — | Allskin-Alpes |
| Sillón / recurso 2 (si aplica) | ⬜ | — | — | Allskin-Alpes |

**Preguntas a confirmar con la clínica:**
- [ ] ¿Cuántos sillones tiene Allskin-Alpes?
- [ ] ¿El agendamiento online usa siempre el mismo sillón?
- [ ] ¿Se requiere `id_recurso` o es opcional en POST /citas?

---

## BLOQUE 4 — Profesionales (Dentistas)

### Endpoint
```
GET /dentistas
Authorization: Token <token>
```

### Campos que devuelve
```json
{
  "id":            123,
  "rut":           "12.345.678-9",
  "nombre":        "María",
  "apellidos":     "González López",
  "email":         "maria@alpesdental.cl",
  "id_especialidad": 4,
  "especialidad":  "Estética Facial",
  "agenda_online": true,
  "intervalo":     30,
  "habilitado":    true
}
```

> **Importante:** El campo en la API se llama `id_dentista`, no `id_profesional`.  
> En el endpoint v5/agendas se usa `id_profesional` — verificar cuál aplica al crear citas.

### Datos a obtener

| Profesional real | Estado | `id_dentista` | `agenda_online` | `intervalo` (min) |
|---|---|---|---|---|
| _____________ | ⬜ | — | — | — |
| _____________ | ⬜ | — | — | — |

**Preguntas a confirmar:**
- [ ] ¿Qué profesionales deben aparecer en el agendamiento online? (`agenda_online: true`)
- [ ] ¿El `intervalo` del profesional debe coincidir con la duración de la prestación?
- [ ] ¿El campo es `id_dentista` o `id_profesional` en POST /citas?

---

## BLOQUE 5 — Prestaciones / Aranceles

La API tiene dos recursos similares:

| Recurso | Endpoint | Descripción |
|---|---|---|
| `/aranceles` | `GET /aranceles` | Aranceles generales con categorías |
| `/prestaciones` | `GET /prestaciones` | Servicios clínicos con precio |

### Campos de `/prestaciones`
```json
{
  "id":          45,
  "nombre":      "Evaluación AllSKIN",
  "codigo":      "EVL-001",
  "precio":      25000,
  "id_categoria": 3,
  "id_tipo":     1
}
```

### Datos a obtener

| Prestación interna | Estado | `id` en Dentalink | Nombre exacto en Dentalink | Duración (min) |
|---|---|---|---|---|
| `evaluacion-allskin` | ⬜ | — | — | — |
| `continuacion-tratamiento` | ⬜ | — | — | — |

**Preguntas a confirmar:**
- [ ] ¿Se usa `/aranceles` o `/prestaciones` al crear una cita?
- [ ] ¿El campo en POST /citas es `id_arancel` o `id_prestacion`?
- [ ] ¿La duración se toma del profesional (`intervalo`) o de la prestación?

---

## BLOQUE 6 — Búsqueda y creación de pacientes

### 6.1 Buscar paciente por RUT

**Opción A — Endpoint dedicado:**
```
GET /pacientes/buscar
Authorization: Token <token>
```

**Opción B — Query filter:**
```
GET /pacientes?q={"rut":{"eq":"11111111-1"}}
Authorization: Token <token>
```

> Confirmar con Dentalink cuál de los dos funciona. Probar ambos.

**Lógica del flujo (ya implementada en mock):**
```
1. Buscar por RUT
2. Si existe  → usar su id_paciente
3. Si no existe → POST /pacientes → guardar el id retornado
4. Usar id_paciente en POST /citas
```

### 6.2 Crear paciente nuevo

```
POST /pacientes
Authorization: Token <token>
Content-Type: application/json

{
  "rut":      "12.345.678-9",
  "nombre":   "María",
  "apellidos": "González López",
  "email":    "maria@correo.com",
  "telefono": "+56912345678"
}
```

### Datos a confirmar

| Item | Estado | Detalle |
|---|---|---|
| Endpoint de búsqueda por RUT | ⬜ | `/buscar` o query filter |
| Formato de RUT aceptado | ⬜ | ¿Con puntos? ¿Con guión? ¿Solo dígitos? |
| Campos mínimos para crear paciente | ⬜ | ¿email obligatorio? ¿teléfono obligatorio? |
| ¿Qué retorna si RUT ya existe? | ⬜ | ¿Error 409 o retorna el paciente? |
| Campo `apellidos` vs `apellido` | ⬜ | Verificar nombre exacto del campo |

---

## BLOQUE 7 — Consulta de disponibilidad (Agenda)

### Endpoints disponibles

**API v1:**
```
GET /agendas?id_sucursal={id}&id_dentista={id}&fecha={YYYY-MM-DD}&duracion={min}
Authorization: Token <token>
```

**API v5 (recomendado — más completo):**
```
GET v5/agendas?id_sucursal={id}&id_profesional={id}&fecha={YYYY-MM-DD}&duracion={min}
Authorization: Token <token>
```

### Formato de respuesta esperado
```json
{
  "data": [
    {
      "hora_inicio": "09:00",
      "hora_fin":    "09:30",
      "id_dentista": 123,
      "nombre":      "María González",
      "duracion":    30
    }
  ]
}
```

### Datos a confirmar

| Item | Estado | Detalle |
|---|---|---|
| ¿v1 o v5? | ⬜ | Probar ambas y ver cuál devuelve más info |
| Rango máximo de fechas consultable | ⬜ | ¿Cuántos días hacia adelante? |
| Estado del slot "disponible" | ⬜ | ¿Campo explícito o ausencia de cita = disponible? |
| Formato de `hora_inicio` | ⬜ | `HH:MM` o `HH:MM:SS` |
| Paginación necesaria | ⬜ | Cursor-based (`links.next`) si hay muchos slots |

---

## BLOQUE 8 — Creación de cita (el endpoint más crítico)

### Endpoint
```
POST /citas
Authorization: Token <token>
Content-Type: application/json
```

### Body requerido (pendiente de confirmar campos exactos)
```json
{
  "id_paciente":    123,
  "id_dentista":    456,
  "id_sucursal":    789,
  "id_recurso":     10,
  "fecha":          "2026-05-26",
  "hora_inicio":    "09:00",
  "duracion":       30,
  "estado":         "pendiente"
}
```

> ⚠️ **Campos a verificar con la documentación real:**
> - ¿`id_dentista` o `id_profesional`?
> - ¿`id_recurso` es obligatorio?
> - ¿`id_arancel` o `id_prestacion` es necesario?
> - ¿`estado` inicial: `"pendiente"`, `"confirmada"` u otro?
> - ¿Se puede enviar `observaciones` o `notas`?

### Flujo completo antes de POST /citas
```
1. Tener id_paciente    (buscar/crear — BLOQUE 6)
2. Tener id_dentista    (obtenido en BLOQUE 4)
3. Tener id_sucursal    (obtenido en BLOQUE 2)
4. Tener id_recurso     (obtenido en BLOQUE 3)
5. Verificar disponibilidad del slot (BLOQUE 7)
6. Ejecutar POST /citas
7. Guardar el id retornado como id_dentalink en la Reserva
```

---

## BLOQUE 9 — Estados de cita

### Endpoint de estados
```
GET /citas/estados
Authorization: Token <token>
```

### Estados probables (confirmar con la API real)

| Estado interno | Estado Dentalink (por confirmar) | Descripción |
|---|---|---|
| `pendiente` | — | Nueva solicitud sin confirmar |
| `confirmada` | — | Confirmada por la clínica |
| `en_atencion` | — | Paciente en box |
| `completada` | — | Atención finalizada |
| `cancelada` | — | Cancelada por cualquier parte |
| `no_asistio` | — | No-show del paciente |

---

## BLOQUE 10 — Prevención de doble reserva

### Problema
Si dos usuarios seleccionan el mismo slot al mismo tiempo, ambos pueden intentar crear la cita. El segundo fallará con un error de Dentalink.

### Estrategia recomendada

**Paso 1 — Verificar disponibilidad justo antes del POST:**
```
1. GET /agendas (verificar que el slot sigue disponible)
2. Si disponible → POST /citas
3. Si no disponible → retornar error "Horario ya no disponible"
```

**Paso 2 — Manejar el error de Dentalink:**
```
POST /citas → HTTP 409 Conflict (slot ocupado)
→ Mostrar al usuario: "El horario seleccionado ya no está disponible. Por favor elige otro."
→ Redirigir a selección de fecha/hora
```

**Paso 3 — En el frontend (ya implementado):**
- Deshabilitar botón "Confirmar" mientras se procesa
- No permitir doble clic

---

## BLOQUE 11 — Dónde debe vivir el token

### ❌ No permitido
```
// INCORRECTO — el token quedaría expuesto en el bundle del navegador
const response = await fetch('https://api.dentalink...', {
  headers: { Authorization: `Token ${import.meta.env.VITE_DENTALINK_TOKEN}` }
})
```

### ✅ Arquitectura correcta
```
Navegador (React)
  → POST /api/reservas  (backend propio, autenticado con sesión propia)
    → Backend/Serverless
      → POST https://api.dentalink.healthatom.com/api/v1/citas
         Authorization: Token <token_solo_en_servidor>
```

### Opciones de backend a elegir

| Opción | Pros | Contras |
|---|---|---|
| **Vercel Edge Functions** | Integra con el mismo deploy | Límite de 1MB, sin Node completo |
| **Vercel API Routes** (Next.js) | Full Node.js, fácil | Requiere migrar a Next.js |
| **Vercel Serverless Functions** | Compatible con Vite actual | Necesita carpeta `/api` |
| **Express propio** (Railway, Render) | Control total | Más infraestructura |
| **Supabase Edge Functions** | Gratis tier generoso | Deno runtime |

> **Recomendación para este proyecto:** Vercel Serverless Functions (carpeta `/api`) — compatible con Vite sin migración.

---

## BLOQUE 12 — Validaciones previas al POST /citas

Antes de enviar la cita a Dentalink, el **backend** debe validar:

```
[ ] paciente.rut          → formato RUT chileno válido (dígito verificador)
[ ] paciente.email        → formato email válido
[ ] paciente.telefono     → no vacío
[ ] prestacion.id_dentalink → número > 0, no null
[ ] profesional.id_dentalink → número > 0, no null
[ ] slot.fecha            → fecha futura (no pasada)
[ ] slot.hora_inicio      → dentro de horario habilitado
[ ] id_sucursal           → constante del servidor, nunca del cliente
[ ] id_recurso            → obtenido de Dentalink, no inventado
[ ] disponibilidad        → verificada en tiempo real antes del POST
```

---

## RESUMEN — Orden de ejecución para la integración

```
Fase 1 — Obtener acceso
  [ ] 1.1  Generar token en panel Dentalink
  [ ] 1.2  Confirmar URL base y si hay sandbox

Fase 2 — Mapear IDs reales
  [ ] 2.1  GET /sucursales → id de Allskin-Alpes
  [ ] 2.2  GET /sillones   → id_recurso disponibles
  [ ] 2.3  GET /dentistas  → ids de profesionales habilitados
  [ ] 2.4  GET /prestaciones o /aranceles → ids de servicios

Fase 3 — Confirmar flujos
  [ ] 3.1  Probar GET /pacientes/buscar con RUT de prueba
  [ ] 3.2  Probar GET v5/agendas con datos reales
  [ ] 3.3  Probar POST /citas en sandbox (si existe) con datos de prueba
  [ ] 3.4  Confirmar estados de cita con GET /citas/estados

Fase 4 — Construir backend
  [ ] 4.1  Crear función serverless con el token en variable de entorno
  [ ] 4.2  Implementar endpoint POST /api/reservas en el backend
  [ ] 4.3  Actualizar ids en mockDentalink.ts con valores reales
  [ ] 4.4  Actualizar dentalink.realService.placeholder.ts con llamadas reales

Fase 5 — Activar (cuando Fase 1–4 estén completas)
  [ ] 5.1  Cambiar 1 línea en src/services/dentalink/index.ts:
           de: export { mockDentalinkService as dentalinkService }
           a:  export { realDentalinkService as dentalinkService }
  [ ] 5.2  Probar flujo completo en staging
  [ ] 5.3  Deploy a producción
```

---

*Ver también:*  
- `docs/API_INTEGRATION_RULES.md` — reglas de seguridad obligatorias  
- `docs/DENTALINK_PENDING_DATA.md` — datos específicos pendientes de obtener  
- `src/services/dentalink/dentalink.realService.placeholder.ts` — esqueleto de implementación  
