import type { ReactNode } from 'react';
import { MAIN_SITE_URL, MERCORA_LAUNCH_LABEL, MERCORA_URL, TIKTOK_URL, X_URL, launchPending } from '../links';
import { ArrowUpRightIcon, CheckIcon, TikTokIcon, XIcon } from './Icons';

/** Every outbound link opens in a new tab and says so to screen readers. */
export function ExtLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function SocialLinks() {
  return (
    <div className="social">
      <ExtLink href={TIKTOK_URL}>
        <TikTokIcon />
        <span className="sr-only">Nenisys on TikTok</span>
      </ExtLink>
      <ExtLink href={X_URL}>
        <XIcon />
        <span className="sr-only">Nenisys on X</span>
      </ExtLink>
    </div>
  );
}

/**
 * Products and services: Mercora Edge, with a read-more link to the main site.
 * The picture lives in /public/mercora-edge-card.webp. If the file is missing the picture area hides itself.
 */
export function MercoraCard() {
  return (
    <section className="product" aria-labelledby="product-title">
      <p className="eyebrow">Products &amp; services</p>
      <div className="pcard">
        {launchPending() && <span className="pcard-badge">Launching {MERCORA_LAUNCH_LABEL}</span>}
        <div className="pcard-img">
          <img
            src="/mercora-edge-card.webp"
            width={1536}
            height={1024}
            alt="Three stacked black metal cards with glowing orange edges"
            loading="lazy"
            decoding="async"
            onError={(e) => e.currentTarget.parentElement?.classList.add('is-missing')}
          />
        </div>
        <div className="pcard-body">
          <h2 id="product-title" className="h-md">
            Mercora Edge
          </h2>
          <p className="lead">
            A proprietary trading firm that evaluates traders and gives qualified ones funded accounts, powered by an
            in-house trading engine.
          </p>
          <ul className="ticks">
            <li>
              <CheckIcon />
              Clear, transparent rules
            </li>
            <li>
              <CheckIcon />
              Funded accounts for qualified traders
            </li>
            <li>
              <CheckIcon />
              Built on an in-house trading engine
            </li>
          </ul>
          <ExtLink className="btn p pcard-cta" href={MERCORA_URL}>
            Read more
            <ArrowUpRightIcon />
          </ExtLink>
          <p className="risk">Trading involves risk. Nothing here is financial advice or a guarantee of profit.</p>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ['Agree and start', 'Read the short notices, tick the box and begin.'],
    ['Answer at your pace', 'Skip optional questions. Go back to change an answer.'],
    ['Submit', 'Nothing is sent until you press Submit, and it is sent anonymously.'],
  ];
  return (
    <section aria-labelledby="how-title">
      <h2 id="how-title" className="eyebrow">
        How it works
      </h2>
      <ol className="how">
        {steps.map(([t, d], i) => (
          <li key={t}>
            <span className="how-n" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <b>{t}</b>
              <span>{d}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Faq() {
  const items: [string, ReactNode][] = [
    ['Is this survey anonymous?', 'Yes. We do not ask for your name or email, and your answers are not linked to you.'],
    [
      'Can I stop and come back later?',
      'Yes. Your progress is kept in this browser on this device, so you can continue later. Nothing is sent until you press Submit.',
    ],
    [
      'Do I have to answer every question?',
      'No. Questions marked Optional can be skipped. Questions marked Required need an answer before you can continue.',
    ],
    [
      'Who runs this survey?',
      <>
        Nenisys, a technology company building products across trading and education. Learn more at{' '}
        <ExtLink href={MAIN_SITE_URL}>nenisys.shop</ExtLink>.
      </>,
    ],
  ];
  return (
    <section aria-labelledby="faq-title">
      <h2 id="faq-title" className="eyebrow">
        Questions
      </h2>
      <div className="faq">
        {items.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Shown under the thank-you and closed screens. */
export function AfterSurvey() {
  return (
    <>
      <MercoraCard />
      <section className="follow2" aria-labelledby="follow-title">
        <p className="follow2-eyebrow">Community</p>
        <h2 id="follow-title" className="h-lg">
          Join the community
        </h2>
        <p className="follow2-sub">Follow our socials for launch news and updates.</p>
        <div className="follow2-actions">
          <ExtLink className="btn follow2-x" href={X_URL}>
            <XIcon />
            <span className="sr-only">Follow on </span>X
          </ExtLink>
          <ExtLink className="btn follow2-tt" href={TIKTOK_URL}>
            <TikTokIcon />
            <span className="sr-only">Follow on </span>TikTok
          </ExtLink>
        </div>
      </section>
    </>
  );
}
