## Plan: Corregir errores de build + crear módulo admin de Eventos

### Parte 1 — Corregir errores de build (bloqueantes)

1. **`src/routes/admin/AttendanceReport.tsx:111`** — coerción de `string | null` a `string | undefined` (usar `?? undefined`).
2. **`src/routes/admin/AttendanceScanner.tsx:408`** — la API de `@yudiel/react-qr-scanner` cambió `onResult` → `onScan`. Ajustar el prop y firma del handler.
3. **`src/routes/index.tsx:124`** — `checkMobile` no está definida (causa también el runtime error actual). Definir el helper dentro del `useEffect` o eliminar la referencia.
4. **`src/routes/index.tsx:181`** — el select de `donations_info` devuelve `SelectQueryError` (relación mal inferida). Simplificar el `.select("*")` o castear vía `unknown as DonationRow[]`.
5. **`src/routes/index.tsx:205`** — quitar el prop `priority` del `<img>` nativo (o cambiar a `<OptimizedImage>` que sí lo acepta).
6. **`src/utils/Logactivity.ts`** — la tabla `activity_log` no existe en `types.ts`. Dos opciones: (a) crear la tabla vía migración, o (b) hacer el log opcional con cast a `any`. Propongo **opción b** (no bloquear build; ya hay `audit_logs` para auditoría real).

### Parte 2 — Módulo Admin de Eventos

**Base de datos:** La tabla `events` ya existe con `id, title, description, event_date, location, image_url, created_at, updated_at` y 7 policies RLS. No requiere migración.

**Nueva ruta:** `src/routes/admin/eventos.tsx`

Estructura:
- Envolver todo el componente con `<ProtectedRoute>` (ya existe en `src/components/auth/ProtectedRoute.tsx`) + verificación de rol `admin` vía `useUserRole()`.
- Si no hay sesión o el rol no es admin → mensaje "Acceso denegado".

**UI (usando tokens del proyecto: `bg-card`, `primary`, `gold`, `border-border`):**

```
┌─ Header: "Gestión de Eventos" + botón "+ Nuevo Evento" (bg-primary)
├─ Formulario (colapsable, bg-card rounded-2xl):
│    - title (input required, max 200)
│    - description (textarea)
│    - event_date (datetime-local, min = ahora)
│    - location (input)
│    - Botones: Guardar (bg-gold) / Cancelar
└─ Lista de eventos futuros (bg-card):
     - Card por evento: título, fecha formateada, ubicación, descripción
     - Íconos lucide: Calendar, MapPin, Trash2
     - Botón eliminar → AlertDialog de shadcn para confirmar
```

**Lógica:**
- `useQuery` (o `useEffect` + estado, siguiendo el patrón del proyecto) para leer `events` donde `event_date >= now()` ordenado ASC.
- Validación cliente: `event_date` no puede ser pasado (mostrar toast con `sonner`).
- Validación con `zod` (título 1-200, fecha futura).
- Insert:
  ```ts
  // TODO: AQUÍ SE CONFIGURARÁ EL WEBHOOK PARA NOTIFICACIONES AUTOMÁTICAS
  await supabase.from("events").insert({...})
  ```
- Delete con confirmación (AlertDialog) → refresca lista.
- Toast de éxito/error con `sonner`.

**Nota:** Ya existe `src/routes/admin/EventsManager.tsx`. Voy a **crear la nueva ruta `eventos.tsx` desde cero** como pediste, sin tocar el manager existente (por si se usa en otro lado).

### Archivos afectados

- ✏️ `src/routes/admin/AttendanceReport.tsx`
- ✏️ `src/routes/admin/AttendanceScanner.tsx`
- ✏️ `src/routes/index.tsx`
- ✏️ `src/utils/Logactivity.ts`
- 🆕 `src/routes/admin/eventos.tsx`

¿Procedo?