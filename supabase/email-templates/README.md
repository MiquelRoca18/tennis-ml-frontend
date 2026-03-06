# Plantillas de correo – Tenly

Plantillas HTML para **Confirm signup** y **Reset password** en Supabase. Diseño alineado con la app (nombre Tenly, logo, color corporativo).

## Cómo usarlas en Supabase

1. Entra en **Supabase Dashboard** → tu proyecto.
2. **Authentication** → **Email Templates**.
3. Elige la plantilla (Confirm signup o Reset password).
4. **Subject** (asunto): pon el que quieras, por ejemplo:
   - Confirm signup: `Confirma tu cuenta en Tenly`
   - Reset password: `Restablece tu contraseña – Tenly`
5. **Message body**: borra el contenido actual y **pega todo** el HTML del archivo correspondiente:
   - `confirm-signup.html` → Confirm signup
   - `reset-password.html` → Reset password
6. Guarda (**Save**).

## Logo en el correo

Las plantillas muestran el logo con esta URL: `https://tennis-ml-landing.vercel.app/tenly-logo.png`.

- Para que el logo se vea en el correo, pon una imagen **PNG** del logo (`tenly-logo.png`) en la **raíz** de la carpeta `tennis-ml-landing` (mismo nivel que `index.html`) y vuelve a desplegar en Vercel/Netlify. Instrucciones detalladas en `tennis-ml-landing/README.md`, sección "Logo en los correos".
- Si no subes el archivo, se verá el texto "Tenly" y el alt de la imagen; el contenido del correo sigue siendo correcto.

## Cambiar el remitente "Supabase Auth"

Por defecto los correos salen como **Supabase Auth** &lt;noreply@mail.app.supabase.io&gt;. Eso **sí se puede cambiar**, pero no desde las plantillas: hay que usar **SMTP personalizado**.

1. **Supabase Dashboard** → **Project Settings** → **Authentication** → **SMTP Settings**.
2. Activa **Custom SMTP** y configura un proveedor (Resend, SendGrid, Brevo, Postmark, etc.) con sus credenciales.
3. En **Sender email** pon la dirección que quieras (ej. `noreply@tudominio.com`).
4. En la mayoría de proveedores puedes definir también el **nombre del remitente** (ej. "Tenly" o "Tenly – Predicciones") en su panel o en el campo que ofrezca Supabase.

Mientras uses el envío por defecto de Supabase, el nombre "Supabase Auth" se mantiene; no es obligatorio, pero para cambiarlo hace falta SMTP propio.

## Archivos

| Archivo | Uso en Supabase |
|--------|------------------|
| `confirm-signup.html` | Confirm signup |
| `reset-password.html` | Reset password |

## Variables que usa Supabase

- `{{ .ConfirmationURL }}` – Enlace de confirmación o de reset (no lo cambies).
- El resto del texto puedes editarlo en el HTML si quieres.

## Diseño

- Fondo gris claro (`#f6f8fa`), tarjeta blanca, borde y sombra suave.
- Logo Tenly arriba (imagen desde la landing) y título "Tenly".
- Botón en color corporativo (`#D4A84B`).
- Textos en grises tipo GitHub (`#0D1117`, `#484F58`, `#8B949E`).
- Enlace de respaldo por si el botón falla en algún cliente de correo.
