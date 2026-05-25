## Plan: Email del formulario + Teléfono de la parroquia

### 1. Email desde el formulario "Escríbenos"

**Objetivo:** cuando alguien llene el formulario, la parroquia reciba un email con sus datos.

**Cómo funciona:**
- Visitante escribe nombre, correo y mensaje → presiona "Enviar".
- El sitio envía un email a **parroquiatrinidadtingo@gmail.com** con el mensaje, con *Responder* apuntando al correo del visitante.
- Se muestra confirmación en pantalla ("Mensaje enviado").
- El botón WhatsApp sigue funcionando como respaldo (se abre después de enviar el email).

**Paso previo obligatorio:** necesitamos configurar un dominio de email (ej. `notify.parroquiatrinidadtingo.lovable.app`). Esto se hace una vez con un botón en el chat. Mientras DNS verifica, todo queda listo.

**Archivos a crear/modificar:**
- Configurar dominio de email + infraestructura (botón en chat)
- `src/routes/api/public/contact.ts` — ruta pública que valida el formulario y encola el email
- `src/lib/email-templates/contact-form-message.tsx` — plantilla del email
- `src/routes/index.tsx` — actualizar el `onSubmit` del formulario para enviar email + mostrar confirmación

### 2. Teléfono fijo de la parroquia

**Objetivo:** mostrar el número (054) 232767 en el sitio.

**Dónde:**
- En la sección de contacto (redes sociales, correo, teléfono)
- En el footer

**Archivo a modificar:**
- `src/routes/index.tsx` — agregar el teléfono en la lista de contacto y en el footer

---

**Datos clave que me diste:**
- Teléfono fijo: (054) 232767
- Correo: parroquiatrinidadtingo@gmail.com
- WhatsApp: +51 932 269 859