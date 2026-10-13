import { useEffect, useRef } from 'react';
import type { AppError } from '../errors';
import { issueMessage, selectionHint, selectionLimits, type AnswerState } from '../lib/answers';
import type { SurveyQuestion } from '../types';
import { AlertIcon, CheckIcon } from './Icons';

interface Props {
  question: SurveyQuestion;
  index: number;
  total: number;
  answer: AnswerState | undefined;
  issue: string | undefined;
  isLast: boolean;
  submitting: boolean;
  submitError: AppError | null;
  onToggle: (optionId: string) => void;
  onOtherText: (text: string) => void;
  onClear: () => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Renders one question from whatever the backend sent. To support a new question type,
 * add it to the parser in services/surveyService.ts and to the type-specific bits below.
 */
export function QuestionStep(p: Props) {
  const q = p.question;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [q.id]);

  const single = q.type === 'single_choice';
  const selected = new Set(p.answer?.optionIds ?? []);
  const atMax = !single && selected.size >= selectionLimits(q).max;
  const otherIssue = p.issue?.startsWith('other_') ?? false;

  const ids = { title: `q-${q.id}-title`, desc: `q-${q.id}-desc`, hint: `q-${q.id}-hint`, err: `q-${q.id}-err` };
  const describedBy = [q.description ? ids.desc : null, ids.hint, p.issue ? ids.err : null].filter(Boolean).join(' ');

  const submitLabel = p.submitting ? 'Sending...' : p.isLast ? 'Submit' : !q.required && selected.size === 0 ? 'Skip' : 'Continue';

  return (
    <form
      className="panel step"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        p.onNext();
      }}
    >
      <div className="step-top">
        <span className="step-count">
          Question {p.index + 1} of {p.total}
        </span>
        <span className={`badge ${q.required ? 'badge-req' : ''}`}>{q.required ? 'Required' : 'Optional'}</span>
      </div>
      <progress className="bar" max={p.total} value={p.index + 1} aria-label="Survey progress" />

      <h2 id={ids.title} ref={headingRef} tabIndex={-1} className="q-title">
        {q.prompt}
      </h2>
      {q.description && (
        <p id={ids.desc} className="q-desc">
          {q.description}
        </p>
      )}
      <p id={ids.hint} className="q-hint">
        {selectionHint(q)}
      </p>

      <div
        className="opts"
        role={single ? 'radiogroup' : 'group'}
        aria-labelledby={ids.title}
        aria-describedby={describedBy}
        aria-required={single && q.required ? true : undefined}
      >
        {q.options.map((o) => {
          const checked = selected.has(o.id);
          const disabled = !checked && atMax;
          const otherId = `other-${q.id}`;
          return (
            <div key={o.id}>
              <label className={`opt${checked ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}>
                <input
                  type={single ? 'radio' : 'checkbox'}
                  name={q.id}
                  value={o.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => p.onToggle(o.id)}
                />
                <span className={`mk ${single ? 'radio' : 'check'}`} aria-hidden="true">
                  <CheckIcon />
                </span>
                <span className="opt-label">{o.label}</span>
              </label>
              {o.kind === 'other' && checked && (
                <div className="other">
                  <label htmlFor={otherId}>Please specify{o.otherRequired ? '' : ' (optional)'}</label>
                  <input
                    id={otherId}
                    type="text"
                    className="text"
                    value={p.answer?.otherText ?? ''}
                    maxLength={o.otherMaxLength}
                    autoComplete="off"
                    aria-invalid={otherIssue || undefined}
                    aria-describedby={otherIssue ? ids.err : undefined}
                    onChange={(e) => p.onOtherText(e.target.value)}
                  />
                  <span className="count">
                    {[...(p.answer?.otherText ?? '')].length}/{o.otherMaxLength}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {p.issue && (
        <p id={ids.err} className="field-error" role="alert">
          <AlertIcon />
          {issueMessage(p.issue, q)}
        </p>
      )}

      {p.isLast && p.submitError && (
        <div className="banner banner-error" role="alert">
          <AlertIcon />
          <span>{p.submitError.message}</span>
        </div>
      )}

      {!q.required && selected.size > 0 && (
        <button type="button" className="btn t" onClick={p.onClear} disabled={p.submitting}>
          Clear my answer
        </button>
      )}

      <div className="btn-row">
        <button type="button" className="btn s" onClick={p.onBack} disabled={p.submitting}>
          Back
        </button>
        <button type="submit" className="btn p" disabled={p.submitting} aria-busy={p.submitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
