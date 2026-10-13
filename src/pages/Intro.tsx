import { useEffect, useRef } from 'react';
import { AlertIcon, CheckIcon, DeviceIcon, ShieldIcon } from '../components/Icons';
import { formatDateTime } from '../lib/format';
import type { OpenSurvey } from '../types';

interface Props {
  survey: OpenSurvey;
  consent: boolean;
  consentError: boolean;
  hasDraft: boolean;
  onConsent: (value: boolean) => void;
  onStart: () => void;
  onStartOver: () => void;
}

export function Intro(p: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const count = p.survey.questions.length;
  const minutes = Math.max(1, Math.ceil(count / 3));
  const closes = formatDateTime(p.survey.closesAt);
  const resuming = p.hasDraft && p.consent;

  return (
    <section className="panel intro">
      <p className="tag">
        <i />
        Survey
      </p>
      <h1 ref={headingRef} tabIndex={-1} className="h-xl">
        Have your say in <span>a few quick questions.</span>
      </h1>
      <p className="lead">
        Up to {count} question{count === 1 ? '' : 's'}, about {minutes} minute{minutes === 1 ? '' : 's'}.
        {closes ? ` Open until ${closes}.` : ''}
      </p>

      <ul className="facts">
        <li>
          <span className="ico">
            <ShieldIcon />
          </span>
          <div>
            <b>Anonymous</b>
            <span>We do not ask for your name or email, and your answers are not linked to you.</span>
          </div>
        </li>
        <li>
          <span className="ico">
            <CheckIcon />
          </span>
          <div>
            <b>Your choice</b>
            <span>Skip optional questions or stop any time. Nothing is sent until you press Submit.</span>
          </div>
        </li>
        <li>
          <span className="ico">
            <DeviceIcon />
          </span>
          <div>
            <b>Saved on your device</b>
            <span>Your progress is kept in this browser, so you can come back to it later.</span>
          </div>
        </li>
      </ul>

      {p.hasDraft && (
        <p className="banner banner-info">We found answers you saved earlier on this device.</p>
      )}

      <div className={`consent${p.consentError ? ' has-error' : ''}`}>
        <label className="consent-row">
          <input
            type="checkbox"
            checked={p.consent}
            onChange={(e) => p.onConsent(e.target.checked)}
            aria-invalid={p.consentError || undefined}
            aria-describedby={p.consentError ? 'consent-err' : undefined}
          />
          <span className="mk check" aria-hidden="true">
            <CheckIcon />
          </span>
          <span>
            I have read and agree to the <a href="#/terms">Terms of Use</a>, the <a href="#/privacy">Privacy Notice</a>{' '}
            and <a href="#/usage">How we use your answers</a>, and I would like to take part.
          </span>
        </label>
        {p.consentError && (
          <p id="consent-err" className="field-error" role="alert">
            <AlertIcon />
            Please tick the box to confirm before you start.
          </p>
        )}
      </div>

      <div className="btn-row">
        <button type="button" className="btn p" onClick={p.onStart}>
          {resuming ? 'Continue where I left off' : 'Start the survey'}
        </button>
        {p.hasDraft && (
          <button type="button" className="btn s" onClick={p.onStartOver}>
            Start over
          </button>
        )}
      </div>
    </section>
  );
}
