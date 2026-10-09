import { useEffect, useRef, type ReactNode } from 'react';
import { strings } from '../i18n/en';

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Bottom sheet dialog (mobile-first). Presentational: no logic inside.
export function Sheet({ title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet__header">
          <h2 className="sheet__title">{title}</h2>
          <button type="button" className="btn btn--ghost" onClick={onClose} aria-label={strings.close}>
            ✕
          </button>
        </header>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
