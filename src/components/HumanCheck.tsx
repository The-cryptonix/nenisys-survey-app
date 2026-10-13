import './human-check.css';
import { AppError } from '../errors';
import { AlertIcon, CheckIcon } from './Icons';
import { TurnstileWidget } from './TurnstileWidget';

interface Props {
  siteKey: string;
  ready: boolean;
  unavailable: boolean;
  /** Changes whenever a fresh check is needed; used as the widget's key. */
  attempt: number;
  onToken: (token: string | null) => void;
  onUnavailable: () => void;
  onRetry: () => void;
  disabled: boolean;
}

/** The human check shown on the last question, with plain status text. Cloudflare's own text is never shown. */
export function HumanCheck(p: Props) {
  return (
    <div className="human">
      <TurnstileWidget key={p.attempt} siteKey={p.siteKey} onToken={p.onToken} onUnavailable={p.onUnavailable} />
      {p.unavailable ? (
        <div className="banner banner-error" role="alert">
          <AlertIcon />
          <span>{new AppError('verification_unavailable').message}</span>
          <button type="button" className="btn t" onClick={p.onRetry} disabled={p.disabled}>
            Try again
          </button>
        </div>
      ) : p.ready ? (
        <p className="human-note ok" role="status">
          <CheckIcon />
          You are confirmed as a person.
        </p>
      ) : (
        <p className="human-note" role="status">
          Checking that you are a person...
        </p>
      )}
    </div>
  );
}
