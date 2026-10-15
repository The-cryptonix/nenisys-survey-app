import type { ReactNode } from 'react';
import '../extras.css';
import { config } from '../config';
import { MAIN_SITE_URL, MERCORA_LAUNCH_LABEL, MERCORA_URL, launchPending } from '../links';
import { ExtLink, SocialLinks } from './Extras';
import { ArrowUpRightIcon, GlobeIcon, WordmarkLogo } from './Icons';

export function Layout({ children }: { children: ReactNode }) {
  const skip = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    document.getElementById('main')?.focus();
  };

  return (
    <>
      <a className="skip" href="#/" onClick={skip}>
        Skip to content
      </a>
      <div className="glow" aria-hidden="true" />
      {launchPending() && (
        <div className="topbanner">
          <div className="wrap topbanner-in">
            <span>Mercora Edge launches {MERCORA_LAUNCH_LABEL}</span>
            <ExtLink href={MERCORA_URL} className="topbanner-link">
              Learn more
              <ArrowUpRightIcon />
            </ExtLink>
          </div>
        </div>
      )}
      <header className="top">
        <div className="wrap top-in">
          <a className="brand" href="#/">
            <span className="logo" aria-hidden="true">
              <svg viewBox="10 10 80 80" focusable="false">
                <circle cx="26" cy="23" r="8" fill="currentColor" />
                <path d="M26 44V77" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
                <path
                  d="M74 23V77L51 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            NENISYS
          </a>
          <ExtLink href={MAIN_SITE_URL} className="nav-pill">
            <GlobeIcon />
            nenisys.shop
          </ExtLink>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap main">
        {children}
      </main>
      <footer>
        <div className="wrap foot">
          <div className="foot-grid">
            <div className="foot-about">
              <span className="foot-logo" role="img" aria-label="Nenisys">
                <WordmarkLogo />
              </span>
              <p>A technology company building products across trading and education.</p>
              <SocialLinks />
            </div>
            <nav aria-label="Explore">
              <h2>Explore</h2>
              <ExtLink href={MAIN_SITE_URL}>Main site</ExtLink>
              <ExtLink href={MERCORA_URL}>Mercora Edge</ExtLink>
            </nav>
            <nav aria-label="Legal">
              <h2>Legal</h2>
              <a href="#/terms">Terms of Use</a>
              <a href="#/privacy">Privacy</a>
              <a href="#/usage">How answers are used</a>
            </nav>
          </div>
          <div className="foot-copy">
            &copy; {new Date().getFullYear()} {config.organisation}
          </div>
        </div>
      </footer>
    </>
  );
}
