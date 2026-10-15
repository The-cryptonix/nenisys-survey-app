import { useMemo, useSyncExternalStore } from 'react';
import type { LegalId } from '../legal/content';

/** Tiny hash router: #/terms, #/privacy, #/usage, #/risk. Anything else is the survey itself. */
export type Route = { kind: 'home' } | { kind: 'legal'; id: LegalId };

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  );
  return useMemo((): Route => {
    const match = /^#\/(terms|privacy|usage|risk)\/?$/.exec(hash);
    return match ? { kind: 'legal', id: match[1] as LegalId } : { kind: 'home' };
  }, [hash]);
}
