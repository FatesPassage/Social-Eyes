/** Only foreground activity should trigger backend reachability checks. */
export function backendLifecycleAction(state: string): 'refresh' | 'invalidate' {
  return state === 'active' ? 'refresh' : 'invalidate';
}
