export type AuthMode = 'sign-in' | 'sign-up';
export type AuthInputResult = { ok: true; email: string; password: string } | { ok: false; message: string };
export function validateAuthInput(email: string, password: string, mode: AuthMode): AuthInputResult {
  if (mode !== 'sign-in' && mode !== 'sign-up') return { ok: false, message: 'Choose a valid account action.' };
  if (typeof email !== 'string' || typeof password !== 'string') return { ok: false, message: 'Enter an email and password.' };
  const normalized = email.trim();
  if (normalized.length > 254 || !/^[^\s@\x00-\x1F\x7F]+@[^\s@\x00-\x1F\x7F]+\.[^\s@\x00-\x1F\x7F]+$/.test(normalized)) return { ok: false, message: 'Enter a valid email address.' };
  if (password.length < 6 || password.length > 1024) return { ok: false, message: 'Password must be 6–1024 characters.' };
  return { ok: true, email: normalized, password };
}
export function validateRecoveryEmail(email: string): { ok: true; email: string } | { ok: false; message: string } {
  if (typeof email !== 'string') return { ok: false, message: 'Enter a valid email address.' };
  const normalized = email.trim();
  if (normalized.length > 254 || !/^[^\s@\x00-\x1F\x7F]+@[^\s@\x00-\x1F\x7F]+\.[^\s@\x00-\x1F\x7F]+$/.test(normalized)) return { ok: false, message: 'Enter a valid email address.' };
  return { ok: true, email: normalized };
}
