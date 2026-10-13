import { useEffect, useRef } from 'react';
import { config } from '../config';
import { LEGAL, LEGAL_ORDER, type LegalId } from '../legal/content';

export function LegalPage({ id }: { id: LegalId }) {
  const doc = LEGAL[id];
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus();
    document.title = `${doc.title} - Nenisys Survey`;
    return () => {
      document.title = 'Nenisys Survey';
    };
  }, [doc]);

  return (
    <article className="panel doc">
      <a className="back" href="#/">
        &larr; Back to the survey
      </a>
      <h1 ref={headingRef} tabIndex={-1} className="h-lg">
        {doc.title}
      </h1>
      <p className="lead">{doc.summary}</p>
      <p className="muted">Last updated {config.legalUpdated}</p>

      {doc.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((block, i) =>
            typeof block === 'string' ? (
              <p key={i}>{block}</p>
            ) : (
              <ul key={i}>
                {block.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ),
          )}
        </section>
      ))}

      <p>
        Questions? Email <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>.
      </p>

      <nav className="legal-nav" aria-label="Other policies">
        {LEGAL_ORDER.filter((other) => other !== id).map((other) => (
          <a key={other} href={`#/${other}`}>
            {LEGAL[other].title}
          </a>
        ))}
      </nav>
    </article>
  );
}
