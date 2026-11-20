export function validatePasswordConfirmation(password: string, confirmation: string): { ok: true } | { ok: false; message: string } {
  if (typeof password !== 'string' || typeof confirmation !== 'string' || password.length < 8 || password.length > 1024) return { ok: false, message: 'Use a password between 8 and 1024 characters.' };
  if (password !== confirmation) return { ok: false, message: 'Passwords must match exactly.' };
  return { ok: true };
}
