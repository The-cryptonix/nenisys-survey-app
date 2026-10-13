import { config } from '../config';
import { AppError } from '../errors';

export interface HttpResult {
  status: number;
  data: unknown;
  retryAfterSeconds: number | null;
}

interface Options {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * One JSON request with a timeout. Never throws raw errors: network problems become
 * typed AppErrors, and a body that is not JSON simply yields data = null.
 */
export async function requestJson(path: string, opts: Options = {}): Promise<HttpResult> {
  if (!config.apiBaseUrl) {
    console.error('VITE_API_BASE_URL is not set');
    throw new AppError('server');
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, opts.timeoutMs ?? config.requestTimeoutMs);
  const onAbort = () => controller.abort();
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const hasBody = opts.body !== undefined;
    const res = await fetch(config.apiBaseUrl + path, {
      method: opts.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...opts.headers,
      },
      body: hasBody ? JSON.stringify(opts.body) : undefined,
      credentials: 'omit',
      mode: 'cors',
      signal: controller.signal,
    });
    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    const retryAfter = Number(res.headers.get('Retry-After'));
    return {
      status: res.status,
      data,
      retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
    };
  } catch {
    if (timedOut) throw new AppError('timeout');
    if (opts.signal?.aborted) throw new AppError('aborted');
    throw new AppError('network');
  } finally {
    window.clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}
