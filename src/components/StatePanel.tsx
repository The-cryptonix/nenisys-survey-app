import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  tone?: 'neutral' | 'warn' | 'danger' | 'success';
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

/** One calm, centred message for every non-question state (closed, failed, thank-you...). */
export function StatePanel({ tone = 'neutral', icon, title, children, actions }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className={`panel state state-${tone}`}>
      <div className="state-icon">{icon}</div>
      <h1 ref={headingRef} tabIndex={-1} className="h-lg">
        {title}
      </h1>
      {children && <div className="lead">{children}</div>}
      {actions && <div className="btn-row center">{actions}</div>}
    </section>
  );
}

export function LoadingPanel() {
  return (
    <section className="panel" role="status" aria-live="polite">
      <span className="sr-only">Loading the survey...</span>
      <div className="sk sk-tag" />
      <div className="sk sk-title" />
      <div className="sk sk-line" />
      <div className="sk sk-line short" />
      <div className="sk sk-block" />
    </section>
  );
}
