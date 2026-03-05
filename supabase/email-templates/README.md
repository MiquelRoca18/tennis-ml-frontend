# Plantillas de correo – Tennis ML

Plantillas HTML para **Confirm signup** y **Reset password** en Supabase. Diseño alineado con la app (colores, tipografía).

## Cómo usarlas en Supabase

1. Entra en **Supabase Dashboard** → tu proyecto.
2. **Authentication** → **Email Templates**.
3. Elige la plantilla (Confirm signup o Reset password).
4. **Subject** (asunto): pon el que quieras, por ejemplo:
   - Confirm signup: `Confirma tu cuenta en Tennis ML`
   - Reset password: `Restablece tu contraseña – Tennis ML`
5. **Message body**: borra el contenido actual y **pega todo** el HTML del archivo correspondiente:
   - `confirm-signup.html` → Confirm signup
   - `reset-password.html` → Reset password
6. Guarda (**Save**).

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
- Botón azul de la app (`#4A90E2`).
- Textos en grises tipo GitHub (`#0D1117`, `#484F58`, `#8B949E`).
- Enlace de respaldo por si el botón falla en algún cliente de correo.
