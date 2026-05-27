# Datos pendientes de Dentalink — Allskin-Alpes

**Proyecto:** Agenda_Allskin  
**Estado:** Sin conexión real — todos los datos son mock  
**Última actualización:** 2026-05-19  

---

## Instrucciones de uso

Este archivo es el **checklist operativo** de lo que debe obtenerse antes de conectar la API real de Dentalink. Completar en orden, ya que algunos datos dependen de otros (ej: necesitas `id_sucursal` antes de consultar los profesionales de esa sucursal).

**Cómo actualizar:** cuando obtengas un dato, marcarlo como `✅ Obtenido` y registrar el valor en la columna correspondiente. Nunca guardar tokens o credenciales aquí — solo IDs y referencias.

---

## 1. Credenciales y acceso a la API

| Item | Estado | Valor / Referencia | Notas |
|---|---|---|---|
| Token de API de Dentalink | ⬜ Pendiente | — | Solo en servidor. No pegar aquí. |
| URL base de la API | ⬜ Pendiente | — | Probable: `https://app.dentalink.cl/api/v1` |
| Versión de la API | ⬜ Pendiente | — | Confirmar con equipo Dentalink |
| Ambiente de sandbox disponible | ⬜ Pendiente | — | Preguntar si existe para pruebas |
| Documentación oficial de la API | ⬜ Pendiente | — | Solicitar acceso si es privada |
| Contacto técnico en Dentalink | ⬜ Pendiente | — | Nombre, email, Slack/Teams si aplica |

**Cómo obtener:**
- Ingresar al panel de Dentalink con cuenta de administrador
- Ir a **Configuración → Integraciones → API**
- Generar o copiar el token de API existente
- Guardar en variable de entorno del backend: `DENTALINK_API_TOKEN`

---

## 2. Sucursal — Allskin-Alpes

| Item | Estado | Valor | Notas |
|---|---|---|---|
| `id_sucursal` de Allskin-Alpes | ⬜ Pendiente | — | Número entero asignado por Dentalink |
| Nombre exacto en Dentalink | ⬜ Pendiente | — | Para verificar que coincide al consultar |
| Dirección registrada en Dentalink | ⬜ Pendiente | — | Para confirmar que es la sucursal correcta |
| Zona horaria configurada | ⬜ Pendiente | — | Importante para evitar errores de hora |

**Cómo obtener:**
```
GET /sucursales
Authorization: Token <api_token>
```
Buscar en la respuesta la sucursal que corresponde a Allskin-Alpes y anotar su `id`.

**Donde usar en el código:**
- `src/data/mockDentalink.ts` → `MOCK_SUCURSAL.id_dentalink`
- Variable de entorno servidor: `DENTALINK_SUCURSAL_ID`

---

## 3. Sillones / Recursos / Boxes

| Item | Estado | `id_sillon` | Nombre en Dentalink | Notas |
|---|---|---|---|---|
| Sillón / box principal | ⬜ Pendiente | — | — | Si hay uno solo, usar siempre ese |
| Sillón / box 2 (si existe) | ⬜ Pendiente | — | — | |
| Sillón / box 3 (si existe) | ⬜ Pendiente | — | — | |

**Cómo obtener:**
```
GET /sucursales/{id_sucursal}/sillones
Authorization: Token <api_token>
```

**Preguntas a confirmar con la clínica:**
- ¿Cuántos sillones/boxes tiene Allskin-Alpes?
- ¿El agendamiento online debe usar siempre el mismo sillón?
- ¿Hay sillones reservados para procedimientos específicos?

**Donde usar en el código:**
- `src/services/dentalink/dentalink.realService.placeholder.ts` → `id_sillon`

---

## 4. Profesionales habilitados

Completar una fila por cada profesional que aparecerá en el sistema de agendamiento.

| Profesional (nombre real) | Estado | `id_profesional` Dentalink | `id` mock actual | Especialidad real | Activo en Dentalink |
|---|---|---|---|---|---|
| Dr./Dra. _____________ | ⬜ Pendiente | — | `prof-demo-1` | — | — |
| Dr./Dra. _____________ | ⬜ Pendiente | — | `prof-demo-2` | — | — |
| (agregar si hay más) | ⬜ Pendiente | — | — | — | — |

**Cómo obtener:**
```
GET /profesionales?id_sucursal={id_sucursal}
Authorization: Token <api_token>
```

**Preguntas a confirmar con la clínica:**
- ¿Qué profesionales quiere mostrar en el agendamiento online?
- ¿Hay profesionales que no deben aparecer (solo interno)?
- ¿La opción "cualquier profesional" aplica para todas las prestaciones?

**Donde actualizar en el código:**
- `src/data/mockDentalink.ts` → `MOCK_PROFESIONALES[x].id_dentalink`

---

## 5. Prestaciones / Atenciones

Completar una fila por cada prestación que se ofrecerá en el sistema de agendamiento.

| Prestación | Estado | `id_atencion` Dentalink | Nombre exacto en Dentalink | Duración (min) | Precio | `id` mock actual |
|---|---|---|---|---|---|---|
| Evaluación dental | ⬜ Pendiente | — | — | — | — | `evaluacion-dental` |
| Limpieza dental | ⬜ Pendiente | — | — | — | — | `limpieza-dental` |
| Evaluación implantológica | ⬜ Pendiente | — | — | — | — | `evaluacion-implantologica` |
| Urgencia dental | ⬜ Pendiente | — | — | — | — | `urgencia-dental` |
| Ortodoncia / alineadores | ⬜ Pendiente | — | — | — | — | `ortodoncia-alineadores` |

**Cómo obtener:**
```
GET /atenciones
Authorization: Token <api_token>
```
(confirmar endpoint exacto con Dentalink — puede llamarse `/prestaciones` o `/tratamientos`)

**Preguntas a confirmar:**
- ¿El nombre de cada prestación en Dentalink coincide con los nombres en el sistema?
- ¿La duración está fija por prestación en Dentalink o depende del profesional?
- ¿Se muestran precios al paciente? (actualmente no se muestran)
- ¿Hay prestaciones que solo puede hacer un profesional específico?

**Donde actualizar en el código:**
- `src/data/mockDentalink.ts` → `MOCK_PRESTACIONES[x].id_dentalink`

---

## 6. Duraciones por prestación y profesional

La duración de la cita es crítica: debe coincidir con el tiempo bloqueado en la agenda del profesional en Dentalink.

| Prestación | Profesional | Duración (min) | Confirmar con Dentalink |
|---|---|---|---|
| Evaluación dental | Todos | 30 (mock actual) | ⬜ Pendiente |
| Limpieza dental | Todos | 60 (mock actual) | ⬜ Pendiente |
| Evaluación implantológica | Dr. Demo 1 | 45 (mock actual) | ⬜ Pendiente |
| Urgencia dental | Todos | 30 (mock actual) | ⬜ Pendiente |
| Ortodoncia / alineadores | Dra. Demo 2 | 30 (mock actual) | ⬜ Pendiente |

**Preguntas a confirmar:**
- ¿La duración en el payload de Dentalink debe coincidir exactamente con la duración del bloque de agenda?
- ¿Si se manda una duración distinta, Dentalink la acepta o la rechaza?

---

## 7. Agenda y disponibilidad

| Item | Estado | Detalle |
|---|---|---|
| Endpoint de consulta de agenda | ⬜ Pendiente | Confirmar URL exacta: `/agenda`, `/horarios`, `/disponibilidad` |
| Formato de fecha en la API | ⬜ Pendiente | Probable `YYYY-MM-DD` — confirmar |
| Formato de hora en la API | ⬜ Pendiente | `HH:MM` o `HH:MM:SS` — confirmar |
| Rango máximo de consulta (días) | ⬜ Pendiente | ¿Cuántos días futuros devuelve la API? |
| Estado de bloque "libre" | ⬜ Pendiente | ¿`libre`, `available`, `0`? — confirmar valor exacto |
| Frecuencia mínima de bloque | ⬜ Pendiente | ¿Bloques de 15, 20, 30, 60 min? |

---

## 8. Flujo de creación de paciente

Antes de crear una cita, Dentalink requiere un `id_paciente`. Confirmar el flujo:

| Paso | Estado | Detalle |
|---|---|---|
| Endpoint de búsqueda por RUT | ⬜ Pendiente | `GET /pacientes?rut={rut}` — confirmar |
| Formato de RUT aceptado | ⬜ Pendiente | ¿Con puntos y guión? ¿Solo números? ¿Con dígito verificador? |
| Endpoint de creación de paciente | ⬜ Pendiente | `POST /pacientes` — confirmar campos obligatorios |
| Campos mínimos para crear paciente | ⬜ Pendiente | Probable: nombre, apellido, rut, email, teléfono |
| ¿Se puede crear paciente sin email? | ⬜ Pendiente | Confirmar si email es obligatorio |
| ¿Se puede crear paciente sin teléfono? | ⬜ Pendiente | Confirmar si teléfono es obligatorio |
| Comportamiento si RUT ya existe | ⬜ Pendiente | ¿Error? ¿Devuelve el paciente existente? |

---

## 9. Creación de cita

| Item | Estado | Detalle |
|---|---|---|
| Endpoint de creación | ⬜ Pendiente | Probable `POST /citas` — confirmar |
| Estado inicial de cita nueva | ⬜ Pendiente | ¿`pendiente`, `confirmada`, otro? |
| ¿Se requiere `id_bloque` al crear? | ⬜ Pendiente | ¿Es obligatorio reservar el bloque de agenda? |
| ¿Se requiere crear "atención" antes? | ⬜ Pendiente | Algunos flujos de Dentalink requieren crear un objeto atención separado |
| Campos obligatorios confirmados | ⬜ Pendiente | Verificar contra documentación oficial |
| Código de error por slot ocupado | ⬜ Pendiente | ¿HTTP 409? ¿Campo en body? |
| ¿Existe límite de citas por día? | ⬜ Pendiente | Por paciente o por profesional |

---

## 10. Estados de cita permitidos

Confirmar los valores exactos que acepta y devuelve Dentalink:

| Estado interno (mock) | Estado en Dentalink | Confirmado |
|---|---|---|
| `pendiente` | — | ⬜ Pendiente |
| `confirmada` | — | ⬜ Pendiente |
| `en_atencion` | — | ⬜ Pendiente |
| `completada` | — | ⬜ Pendiente |
| `cancelada` | — | ⬜ Pendiente |
| `no_asistio` | — | ⬜ Pendiente |

---

## Resumen de prioridad

Para empezar la integración, el orden mínimo requerido es:

```
1. Token de API          ← sin esto no hay acceso
2. URL base confirmada   ← para construir el cliente HTTP
3. id_sucursal           ← necesario en casi todos los endpoints
4. id_sillon             ← requerido en POST /citas
5. id_profesionales      ← requerido en POST /citas
6. id_atenciones         ← requerido en POST /citas
7. Flujo de paciente     ← buscar/crear antes de POST /citas
8. Formato de agenda     ← para mostrar disponibilidad real
```

---

## Cómo completar este archivo

1. Cuando obtengas un dato, reemplaza `⬜ Pendiente` por `✅ Obtenido`
2. Anota el valor en la columna correspondiente (excepto tokens — esos solo van al servidor)
3. Actualiza `id_dentalink` en `src/data/mockDentalink.ts` con los valores reales obtenidos
4. Una vez todos los ítems estén `✅`, revisar el checklist de `src/services/dentalink/dentalink.realService.placeholder.ts` antes de activar el servicio real

---

*Ver también: `docs/API_INTEGRATION_RULES.md` para las reglas de seguridad.*
