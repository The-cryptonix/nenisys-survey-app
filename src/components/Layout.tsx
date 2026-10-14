import type { ReactNode } from 'react';
import { config } from '../config';
import { TikTokIcon, XIcon } from './Icons';

const TIKTOK_URL = 'https://www.tiktok.com/@nenisys.com';
const X_URL = 'https://x.com/NENISYS';

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
      <header className="top">
        <div className="wrap">
          <a className="brand" href="#/">
            <span className="mark" aria-hidden="true">
              N
            </span>
            NENISYS
          </a>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap main">
        {children}
      </main>
      <footer>
        <div className="wrap foot">
          <div className="foot-top">
            <div className="foot-brand">
              <b>NENISYS</b>
              <span>Follow us for updates</span>
            </div>
            <div className="social">
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Nenisys on TikTok (opens in a new tab)">
                <TikTokIcon />
              </a>
              <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="Nenisys on X (opens in a new tab)">
                <XIcon />
              </a>
            </div>
          </div>
          <nav aria-label="Legal">
            <a href="#/terms">Terms of Use</a>
            <a href="#/privacy">Privacy</a>
            <a href="#/usage">How answers are used</a>
          </nav>
          <div className="foot-copy">
            &copy; {new Date().getFullYear()} {config.organisation}
          </div>
        </div>
      </footer>
    </>
  );
}
