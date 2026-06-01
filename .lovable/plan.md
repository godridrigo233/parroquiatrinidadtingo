## Objetivo

Que el formulario "Escríbenos" envíe el mensaje directamente al correo **pstrinidadtingo@gmail.com** sin abrir el cliente de correo del usuario, y muestre una notificación de confirmación al enviarse.

## Cómo se hará

1. **Configurar el sistema de correos de Lovable**
   - Para enviar correos desde la web hace falta verificar un dominio remitente (ej. `notify.parroquiatrinidadtingo.lovable.app` o uno propio). Lovable abrirá un asistente para configurarlo.
   - Una vez configurado, se prepara la infraestructura interna para enviar correos.

2. **Plantilla de correo**
   - Se crea una plantilla con el aspecto de la parroquia (colores dorado/azul, logo) que incluye: nombre del remitente, correo, mensaje y fecha.
   - El correo llegará a **pstrinidadtingo@gmail.com** con asunto: *"Nuevo mensaje desde la web — [nombre]"*.

3. **Conectar el formulario**
   - Se reemplaza el `mailto:` actual por un envío real al servidor de la parroquia.
   - El formulario validará y enviará el mensaje sin redirigir.
   - Al terminar, se muestra una notificación tipo *toast* en pantalla:
     - Éxito: *"Mensaje enviado. Te responderemos pronto."*
     - Error: *"No se pudo enviar. Inténtalo nuevamente o escríbenos por Facebook."*
   - Mientras se envía, el botón mostrará "Enviando…" y quedará deshabilitado.

4. **Anti-spam mínimo**
   - Validación básica del correo y campo oculto "honeypot" para evitar bots.

## Lo que necesito de ti

Para empezar tendrás que completar un breve diálogo de configuración del dominio de correo (1 sola vez). Lovable se encarga del resto automáticamente — no necesitas cuentas externas ni claves API.

¿Avanzo con esto?