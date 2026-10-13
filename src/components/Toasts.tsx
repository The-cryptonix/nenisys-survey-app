import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './Icons';

export type ToastTone = 'error' | 'info' | 'success';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  push: (tone: ToastTone, message: string) => void;
}

const ToastContext = createContext<ToastApi>({ push: () => undefined });

export const useToast = (): ToastApi => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      if (!message) return;
      const id = ++seq.current;
      setToasts((all) => [...all.filter((t) => t.message !== message).slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), tone === 'error' ? 8000 : 5000);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
            <span className="toast-icon">
              {t.tone === 'error' ? <AlertIcon /> : t.tone === 'success' ? <CheckIcon /> : <InfoIcon />}
            </span>
            <p>{t.message}</p>
            <button type="button" className="toast-close" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
