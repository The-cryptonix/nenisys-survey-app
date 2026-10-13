/**
 * Typed errors. Backend error codes never reach the UI: every error carries a
 * plain-language message chosen here, and nothing from the response body is shown.
 */

export type ErrorKind =
  | 'network'
  | 'timeout'
  | 'server'
  | 'bad_response'
  | 'rate_limited'
  | 'closed'
  | 'not_open'
  | 'unavailable'
  | 'outdated'
  | 'validation'
  | 'conflict'
  | 'client'
  | 'aborted';

export interface ServerIssue {
  questionId?: string;
  code: string;
}

const TRANSIENT: ReadonlySet<ErrorKind> = new Set<ErrorKind>(['network', 'timeout', 'server']);

function messageFor(kind: ErrorKind, retryAfterSeconds: number | null): string {
  switch (kind) {
    case 'network':
      return "We couldn't reach the server. Please check your internet connection and try again.";
    case 'timeout':
      return 'That is taking longer than expected. Please try again.';
    case 'server':
      return 'Something went wrong on our side. Your answers are still saved on this device. Please try again in a moment.';
    case 'bad_response':
      return 'We got an unexpected reply and could not show the survey. Please try again.';
    case 'rate_limited': {
      if (retryAfterSeconds && retryAfterSeconds > 0) {
        const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
        return `You have made a lot of attempts in a short time. Please wait about ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`;
      }
      return 'You have made a lot of attempts in a short time. Please wait a few minutes and try again.';
    }
    case 'closed':
      return 'This survey is no longer accepting responses.';
    case 'not_open':
      return 'This survey has not opened yet.';
    case 'unavailable':
      return 'There is no survey available right now.';
    case 'outdated':
      return 'The survey was just updated. We loaded the latest version and kept your answers where we could.';
    case 'validation':
      return 'A few answers need your attention. We have marked them for you.';
    case 'conflict':
      return "We couldn't send that response safely. Please press Submit again.";
    case 'client':
      return "We couldn't send your response from this page. Please refresh the page and try again.";
    case 'aborted':
      return '';
  }
}

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly issues: ServerIssue[];
  readonly retryAfterSeconds: number | null;

  constructor(kind: ErrorKind, opts: { issues?: ServerIssue[]; retryAfterSeconds?: number | null } = {}) {
    super(messageFor(kind, opts.retryAfterSeconds ?? null));
    this.name = 'AppError';
    this.kind = kind;
    this.issues = opts.issues ?? [];
    this.retryAfterSeconds = opts.retryAfterSeconds ?? null;
  }

  /** Worth retrying automatically with the same request. */
  get transient(): boolean {
    return TRANSIENT.has(this.kind);
  }
}

export function toAppError(e: unknown): AppError {
  return e instanceof AppError ? e : new AppError('server');
}
