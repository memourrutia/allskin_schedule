# Reglas de integración con la API de Dentalink

**Proyecto:** Agenda_Allskin  
**Estado actual:** Solo datos mock — sin conexión real a Dentalink  
**Última actualización:** 2026-05-19  

---

## Contexto

Este documento define las reglas técnicas y de seguridad que **deben cumplirse** antes y durante la conexión real con la API de Dentalink. Son de cumplimiento obligatorio para todo desarrollador que trabaje en este proyecto.

El objetivo es evitar errores graves: citas duplicadas, exposición de credenciales, creación de datos inválidos, o acceso no autorizado a la cuenta de Dentalink de la clínica.

---

## Regla 1 — El frontend no se conecta directamente a Dentalink si hay token privado

**Prohibido:**
```
Navegador → HTTPS → https://app.dentalink.cl/api/v1/citas
             con header: Authorization: Token <api_token_privado>
```

**Requerido:**
```
Navegador → HTTPS → Backend propio (proxy/serverless) → Dentalink
```

El token de Dentalink es una credencial privada. Si se incluye en el código del frontend (aunque sea en una variable de entorno de Vite como `VITE_DENTALINK_TOKEN`), queda expuesto en el bundle compilado y es visible para cualquier usuario con DevTools.

**Implementación aceptable:**
- Función serverless (Vercel Edge Function, Netlify Function, AWS Lambda)
- API route en Next.js, Nuxt, o framework similar con server-side rendering
- Backend Express / Fastify / NestJS propio
- El frontend llama al backend propio con autenticación propia (sesión, JWT, etc.)
- El backend llama a Dentalink con el token de API en el servidor

**Excepción:** si Dentalink provee un token de solo lectura o de acceso público limitado (ej: solo consultar disponibilidad sin datos de pacientes), se puede evaluar caso a caso con confirmación explícita.

---

## Regla 2 — La conexión real siempre pasa por backend o serverless function

La capa de servicio `dentalink.realService.placeholder.ts` actualmente lanza errores. Cuando se implemente, **no debe hacer `fetch()` directamente desde el cliente React**.

El flujo correcto:

```
useBooking (hook React)
  ↓
dentalinkService.crearReserva() [src/services/dentalink/index.ts]
  ↓
POST /api/reservas (endpoint propio del backend)
  ↓
Backend: valida datos → llama a Dentalink API con token privado
  ↓
Dentalink API → responde con cita creada
  ↓
Backend → responde al frontend con datos mapeados (sin exponer internos de Dentalink)
```

---

## Regla 3 — Nunca exponer tokens en el navegador

**Prohibido en cualquier archivo que Vite procese para el cliente:**
```bash
VITE_DENTALINK_API_TOKEN=abc123xyz   # ← INCORRECTO, quedará en el bundle
```

**Correcto en servidor:**
```bash
DENTALINK_API_TOKEN=abc123xyz        # Sin prefijo VITE_ → solo disponible en servidor
```

**Verificación:** antes de hacer deploy, ejecutar:
```bash
grep -r "DENTALINK" dist/
```
No debe aparecer ningún token real. Si aparece, hay una fuga de credencial.

---

## Regla 4 — Nunca inventar o hardcodear IDs reales de Dentalink

Los siguientes valores son **IDs numéricos reales** que Dentalink asigna internamente y son únicos por cuenta:

- `id_sucursal` (Allskin-Alpes)
- `id_profesional` (cada doctor/a)
- `id_sillon` (cada box/sala)
- `id_paciente` (cada paciente)
- `id_atencion` (cada prestación/tratamiento)

**Nunca** usar valores como `1`, `0`, `999`, o cualquier número inventado. Un ID incorrecto puede:
- Crear citas en la sucursal equivocada
- Asignar a un profesional que no existe
- Fallar silenciosamente o crear datos corruptos en Dentalink
- Asignar la cita a un paciente distinto

Los IDs reales deben obtenerse mediante llamadas a la API de Dentalink y almacenarse en variables de entorno del servidor o configuración segura. Ver `docs/DENTALINK_PENDING_DATA.md`.

---

## Regla 5 — La única sucursal habilitada para este MVP es Allskin-Alpes

El sistema está construido para una sola sucursal: **Allskin-Alpes**.

- `MOCK_SUCURSAL.id = 'allskin-alpes'` es la única sucursal en `mockDentalink.ts`
- No existe UI para seleccionar sucursal (intencionalmente omitida)
- Si Dentalink devuelve varias sucursales, el sistema debe filtrar y usar **únicamente** la que corresponde a Allskin-Alpes

Al conectar la API real:
- Obtener la lista de sucursales con `GET /sucursales`
- Identificar Allskin-Alpes por nombre o por ID previamente conocido
- Guardar su `id_sucursal` como constante del servidor
- No permitir que el código use otro `id_sucursal` bajo ninguna circunstancia

Si en el futuro se agregan sucursales, ese es un cambio de scope que requiere revisión explícita del flujo completo.

---

## Regla 6 — El usuario no puede elegir ni cambiar de sucursal

La sucursal es fija y transparente para el paciente. No debe existir:
- Un dropdown de sucursales en el formulario
- Un parámetro de URL que permita cambiar de sucursal
- Una lógica que lea `?sucursal=` de la query string sin validación estricta

Si se implementa routing multiucursal en el futuro, debe hacerse mediante configuración del backend, no mediante input del usuario.

---

## Regla 7 — Validar todos los campos antes de crear una cita real

Antes de ejecutar `POST /citas` en Dentalink, el backend debe validar que existan y sean coherentes **todos** los siguientes datos:

| Campo | Validación mínima requerida |
|---|---|
| `paciente.nombre` | No vacío |
| `paciente.apellido` | No vacío |
| `paciente.rut` | Formato RUT chileno válido (dígito verificador correcto) |
| `paciente.email` | Formato email válido |
| `paciente.telefono` | No vacío |
| `prestacion.id_dentalink` | Número > 0, existe en Dentalink |
| `profesional.id_dentalink` | Número > 0, existe en Dentalink, atiende esa prestación |
| `slot.fecha` | Formato YYYY-MM-DD, fecha futura (no pasada) |
| `slot.hora_inicio` | Formato HH:MM, dentro de horario habilitado |
| `slot.duracion` | Positivo, compatible con la agenda del profesional |
| `id_sillon` | Número > 0, existe en Dentalink, disponible en ese horario |
| `disponibilidad` | Verificar en tiempo real con Dentalink antes de crear (ver Regla 9) |

Una validación fallida debe:
1. Retornar error claro al frontend sin información sensible
2. No llegar al `POST /citas` de Dentalink
3. Registrar el error en los logs del servidor

---

## Regla 8 — Antes de activar POST real a Dentalink, debe existir modo sandbox o confirmación manual

El flujo de agendamiento **no puede ir directamente a producción de Dentalink** sin una etapa intermedia.

**Etapas requeridas antes de activar en producción:**

1. **Sandbox / ambiente de pruebas:** si Dentalink provee un ambiente de staging, usarlo para todas las pruebas de integración. Nunca probar con datos reales de pacientes.

2. **Confirmación manual:** durante la fase inicial de integración, todas las citas creadas por el sistema deben ser revisadas y confirmadas manualmente por personal de la clínica antes de considerarse válidas.

3. **Feature flag:** implementar un flag de configuración (`DENTALINK_REAL_ENABLED=false`) que permita desactivar los POSTs reales sin cambiar código. El flag debe ser `false` por defecto.

4. **Prueba con datos de prueba:** antes del primer POST real, usar un paciente de prueba con RUT ficticio (ej: 11.111.111-1) en coordinación con Dentalink.

---

## Regla 9 — El sistema debe prevenir el doble agendamiento

Un slot puede ser tomado por dos usuarios simultáneamente si no existe protección. Estrategias requeridas:

**En el frontend:**
- Al seleccionar un slot, marcarlo visualmente como "en proceso"
- No permitir doble clic en el botón de confirmar (deshabilitar mientras carga)
- Si la creación falla con "slot ocupado", mostrar mensaje y redirigir a la selección de horario

**En el backend (obligatorio):**
- Antes de `POST /citas`, hacer `GET /agenda/{slot_id}` para verificar que el slot sigue disponible
- Si Dentalink soporta bloqueo optimista (lock temporal del slot), usarlo
- Si dos requests llegan simultáneamente, el primero en confirmar gana; el segundo recibe error 409 de Dentalink → manejar ese error explícitamente

**Manejo de error 409 de Dentalink:**
```
Respuesta al frontend: "El horario seleccionado ya no está disponible. Por favor elige otro."
Log en servidor: fecha, hora, id_profesional, slot_id (sin datos del paciente)
```

---

## Regla 10 — Registrar errores sin exponer información sensible al paciente

**Lo que el paciente NUNCA debe ver:**
- IDs internos de Dentalink (`id_sucursal`, `id_profesional`, etc.)
- Stack traces o mensajes de error técnicos
- Tokens o credenciales (parciales o completos)
- Información de otros pacientes
- Detalles del sistema interno

**Lo que el paciente debe ver ante un error:**
- Un mensaje claro y humano: `"Ocurrió un problema al procesar tu solicitud. Por favor intenta de nuevo o contáctanos al +56 2 1234 5678."`
- Un código de referencia genérico si es útil para soporte: `ERR-2026-001`

**En los logs del servidor (privados):**
- Timestamp
- Tipo de error y HTTP status de Dentalink
- IDs técnicos involucrados (sin datos del paciente)
- Stack trace completo
- Nunca RUT, nombre, email, ni teléfono en los logs

**Implementación sugerida:**
```
Error de Dentalink (detallado) → Logger privado del servidor
                               → Respuesta genérica al frontend
```

---

## Resumen de prohibiciones absolutas

| Acción | Estado |
|---|---|
| `fetch()` a Dentalink desde el navegador con token | ❌ Prohibido |
| `VITE_DENTALINK_TOKEN` en variables de Vite | ❌ Prohibido |
| IDs de Dentalink hardcodeados en el código | ❌ Prohibido |
| Selección de sucursal por el usuario | ❌ No aplica en este MVP |
| POST a Dentalink sin validar disponibilidad previa | ❌ Prohibido |
| Mostrar errores técnicos de Dentalink al paciente | ❌ Prohibido |
| Activar POST real sin fase de sandbox o confirmación manual | ❌ Prohibido |

---

*Ver también: `docs/DENTALINK_PENDING_DATA.md` para el listado de datos que deben obtenerse antes de conectar.*
