import { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare's script once, only when a check is actually needed (the last question). */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile_missing')));
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error('turnstile_load_failed'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface Props {
  siteKey: string;
  /** Called with a fresh token, or null when the token expired or the check failed. */
  onToken: (token: string | null) => void;
  /** Called when the check could not load or run at all (blocked script, offline). */
  onUnavailable: () => void;
}

/**
 * Cloudflare Turnstile. Tokens are single use, so the parent remounts this component (via key) to get a new one.
 * The check normally finishes by itself in a moment; a visible step only appears if Cloudflare wants more proof.
 * No text from Cloudflare is shown by the app.
 */
export function TurnstileWidget({ siteKey, onToken, onUnavailable }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const apiRef = useRef<TurnstileApi | null>(null);
  const handlers = useRef({ onToken, onUnavailable });

  useEffect(() => {
    handlers.current = { onToken, onUnavailable };
  }, [onToken, onUnavailable]);

  useEffect(() => {
    let cancelled = false;
    const box = boxRef.current;
    if (!box) return;

    loadTurnstile()
      .then((api) => {
        if (cancelled) return;
        apiRef.current = api;
        idRef.current = api.render(box, {
          sitekey: siteKey,
          theme: 'dark',
          appearance: 'interaction-only',
          'refresh-expired': 'auto',
          callback: (token: string) => handlers.current.onToken(token),
          'expired-callback': () => handlers.current.onToken(null),
          'timeout-callback': () => handlers.current.onToken(null),
          'error-callback': () => {
            handlers.current.onToken(null);
            handlers.current.onUnavailable();
            return true;
          },
        });
      })
      .catch(() => {
        if (!cancelled) handlers.current.onUnavailable();
      });

    return () => {
      cancelled = true;
      if (idRef.current && apiRef.current) apiRef.current.remove(idRef.current);
      idRef.current = null;
      handlers.current.onToken(null);
    };
  }, [siteKey]);

  return <div ref={boxRef} className="human-check" />;
}
