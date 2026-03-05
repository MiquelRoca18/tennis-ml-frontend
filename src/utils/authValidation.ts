/**
 * Validación de email y contraseña para login/registro.
 * Mensajes claros para el usuario (sin jerga técnica).
 */

export function validateEmail(email: string): { valid: boolean; message?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, message: 'Introduce tu correo electrónico.' };
  }
  if (/\s/.test(trimmed)) {
    return { valid: false, message: 'El correo no puede contener espacios.' };
  }
  if (!trimmed.includes('@')) {
    return { valid: false, message: 'El correo debe incluir @ (por ejemplo: nombre@centro.es).' };
  }
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[1].includes('.')) {
    return { valid: false, message: 'El correo debe tener un dominio válido con punto (por ejemplo: nombre@centro.es).' };
  }
  return { valid: true };
}

export function validatePassword(
  password: string,
  options?: { emailForLocalPart?: string }
): { valid: boolean; message?: string } {
  if (password.length < 10) {
    return { valid: false, message: 'La contraseña debe tener al menos 10 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una letra mayúscula.' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un número.' };
  }
  if (options?.emailForLocalPart) {
    const localPart = options.emailForLocalPart.split('@')[0].trim().toLowerCase();
    if (localPart && password.toLowerCase().includes(localPart)) {
      return { valid: false, message: 'La contraseña no puede contener la parte de tu correo antes de la @.' };
    }
  }
  return { valid: true };
}
