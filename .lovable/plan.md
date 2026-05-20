## Cambios

**1. `src/routes/index.tsx` línea 114** — Dejar solo la cita bíblica:
```
«Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.»
```
(quitar el texto " — Una comunidad viva en Tingo, animada por las Carmelitas de María Inmaculada.")

**2. Reemplazar el número `+51 (054) 000-000` y los enlaces `wa.me/51900000000`** por el número real **+51 932 269 859** en:
- `src/routes/index.tsx` línea 390 (texto visible de contacto) → `+51 932 269 859`
- `src/routes/index.tsx` línea 435 (link WhatsApp del formulario) → `https://wa.me/51932269859`
- `src/components/site/WhatsAppFab.tsx` línea 6 (botón flotante de WhatsApp) → `https://wa.me/51932269859`

No se tocan otros archivos ni lógica.