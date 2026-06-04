## Objetivo

Tres mejoras al sitio de la Parroquia Santísima Trinidad:

1. **Sección de Sacramentos** con requisitos detallados (lo más buscado).
2. **Meta tags y og:image** por página para previsualizaciones bonitas en WhatsApp/Facebook.
3. **Mejoras de contraste y modo claro/oscuro** para mejor legibilidad.

---

## 1. Nueva página de Sacramentos

Se crea una ruta dedicada `/sacramentos` (con su propia URL compartible) que cubre los 7 sacramentos, priorizando los 4 más consultados:

- **Bautismo**: requisitos (partida de nacimiento, padrinos confirmados, charlas pre-bautismales), edad, costos referenciales, qué traer el día de la celebración.
- **Primera Comunión**: edad, catequesis (duración, días), requisitos para niños y para adultos.
- **Confirmación**: edad mínima, catequesis previa, padrinos.
- **Matrimonio**: documentos (partidas de bautismo recientes, DNI, charlas prematrimoniales), tiempo de anticipación, expediente matrimonial.
- **Reconciliación (Confesión)**: horarios disponibles.
- **Unción de los enfermos**: cómo solicitarla a domicilio.
- **Orden sacerdotal**: contacto vocacional.

Cada sacramento se presenta como tarjeta expandible (Accordion) con ícono dorado, lista de requisitos, horarios de atención y un botón "Solicitar información" que abre el formulario de contacto con el asunto pre-llenado.

En la página de inicio, la sección actual de "Vida sacramental" añade un botón **"Ver requisitos completos →"** que lleva a `/sacramentos`.

Se añade el enlace **"Sacramentos"** en el Navbar.

## 2. Meta tags y og:image por página

Cada ruta tendrá su propio `head()` con metadata específica:

- `/` (Home): título, descripción y og:image actual de la parroquia.
- `/sacramentos`: título "Sacramentos — Parroquia Santísima Trinidad de Tingo", descripción de los servicios, og:image temática.
- Imágenes para compartir: se reutiliza la imagen del hero / Santísima Trinidad como og:image en cada ruta correspondiente.

Incluye: `title`, `description`, `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `twitter:card`. También JSON-LD tipo **Church** / **CatholicChurch** en la home con dirección, horarios de misa y teléfono — esto ayuda a que Google muestre la parroquia con horarios en los resultados de búsqueda.

## 3. Contraste y modo claro/oscuro

- **Auditoría de contraste**: revisar secciones con texto dorado sobre fondos claros y textos `muted-foreground` que pierden legibilidad, ajustando los tokens en `src/styles.css` para cumplir WCAG AA.
- **Toggle de tema** (sol/luna) en el Navbar, con persistencia en localStorage y respeto a `prefers-color-scheme` del sistema.
- **Modo claro pulido**: definir bien las variables `--background`, `--foreground`, `--gold`, `--muted` para que el modo claro se vea elegante (no solo "invertido").
- Script anti-flash (`ScriptOnce`) para evitar parpadeo al cargar.

---

## Detalles técnicos

- Nueva ruta: `src/routes/sacramentos.tsx` (TanStack file-based routing).
- Componentes shadcn ya disponibles: `Accordion`, `Card`, `Button`.
- Para el toggle de tema: hook `useTheme` simple + botón en `Navbar.tsx`; clase `dark` en `<html>`.
- `head()` por ruta con dominio `https://parroquiatrinidadtingo.lovable.app`.
- JSON-LD se inyecta vía `scripts` en `head()` de `/`.

---

## Lo que NO incluye este plan

- No conecta el formulario al envío real de correo (eso queda en el plan previo, pendiente de configurar el dominio).
- No se cambia el contenido de horarios ni datos de contacto existentes.

¿Procedo?