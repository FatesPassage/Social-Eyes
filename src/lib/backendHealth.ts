import { isBackendConfigured, isSafePublicBackendConfig } from '@/lib/supabase';

export type BackendStatus = 'checking' | 'reachable' | 'unreachable' | 'unconfigured' | 'paused';

/** reachability, not database authorization or proof that RLS is configured. */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!isBackendConfigured || !isSafePublicBackendConfig(url, key)) return 'unconfigured';
  let endpoint: URL;
  try {
    endpoint = new URL(url);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password ||
      endpoint.search || endpoint.hash || endpoint.pathname !== '/') return 'unconfigured';
    endpoint.pathname = '/auth/v1/health';
  } catch {
    return 'unconfigured';
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<BackendStatus>(resolve => {
    timer = setTimeout(() => {
      controller.abort();
      resolve('unreachable');
    }, 6000);
  });
  const request: Promise<BackendStatus> = Promise.resolve().then(() =>
    fetch(endpoint.toString(), {
      method: 'GET',
      headers: { apikey: key },
      signal: controller.signal,
    })
  ).then(response => response.ok ? 'reachable' : 'unreachable', () => 'unreachable');
  try {
    return await Promise.race([request, deadline]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
