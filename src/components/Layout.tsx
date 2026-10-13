import type { ReactNode } from 'react';
import { config } from '../config';

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
          <span>
            &copy; {new Date().getFullYear()} {config.organisation}
          </span>
          <nav aria-label="Legal">
            <a href="#/terms">Terms of Use</a>
            <a href="#/privacy">Privacy</a>
            <a href="#/usage">How answers are used</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
