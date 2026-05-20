## Reemplazar la sección "Noticias y avisos" con el Page Plugin oficial de Facebook

### Qué hago

En la sección `#noticias` de `src/routes/index.tsx`, sustituyo el grid de noticias internas (las que vienen de la base de datos) por un embed oficial de Facebook Page Plugin que muestra los últimos posts de **facebook.com/parroquiasantisimatrinidadtingo** en tiempo real.

### Cómo se ve

- Mantengo el título de sección **"Noticias y avisos"** con el mismo estilo dorado + serif que ya tienes.
- Mantengo el botón **"Síguenos en Facebook"** arriba a la derecha.
- Mantengo el banner dorado de **"Próximos eventos"** (sigue saliendo de la base de datos del admin).
- Debajo: el feed de Facebook embebido (tabs: posts y eventos, altura ~700px, ancho responsive hasta 500px máximo según limitaciones del plugin, centrado en un card claro con sombra para que combine con el resto del diseño).

### Cómo lo implemento técnicamente

- Creo un componente `src/components/site/FacebookFeed.tsx` que renderiza el iframe oficial:
  ```
  https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/parroquiasantisimatrinidadtingo&tabs=timeline&width=500&height=700&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true
  ```
- Es un `<iframe>` puro — **no requiere SDK de Facebook, ni clave de API, ni token**. Solo necesita que tu página de Facebook sea pública (ya lo es).
- Carga `loading="lazy"` para no afectar el rendimiento del hero.

### Limitaciones que debes saber (importante)

1. **El widget se ve "como Facebook"** (fondo blanco, fuente de Facebook). No se puede personalizar el color dorado/azul dentro del iframe — es una restricción de Facebook.
2. **Ancho máximo ~500px**: Facebook no permite plugins más anchos. Por eso lo centro en un card.
3. **Bloqueadores de rastreadores** (uBlock, Brave shields, etc.) pueden ocultarlo a algunos visitantes. Para esos casos dejo un mensaje de fallback con link directo a Facebook.
4. La sección **"Noticias" del panel admin** (`/admin`) deja de mostrarse en el sitio público. ¿La dejo igual en el panel por si más adelante quieres volver a usarla, o también la quito del admin? — *Propongo dejarla en el admin sin tocarla, así no perdemos nada.*

### Archivos a modificar

- `src/components/site/FacebookFeed.tsx` — **nuevo** componente con el iframe.
- `src/routes/index.tsx` — reemplazo el grid de `news.map(...)` por `<FacebookFeed />` dentro de la sección `#noticias`. Quito el `useState`/`fetch` de `news` que ya no se usa.

### Lo que NO toco

- Base de datos, panel admin, eventos, horarios, ministerios, galería, hero, footer, WhatsApp, Instagram — todo igual.