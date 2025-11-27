import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  timeout?: number;
}

interface ToastContextType {
  items: ToastItem[];
  push: (item: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push: ToastContextType['push'] = useCallback((item) => {
    const id = Math.random().toString(36).slice(2);
    const next: ToastItem = { id, timeout: 4000, ...item };
    setItems((prev) => [...prev, next]);
    if (next.timeout && next.timeout > 0) {
      window.setTimeout(() => remove(id), next.timeout);
    }
  }, [remove]);

  const typed = useMemo(() => ({
    success: (message: string, title?: string) => push({ type: 'success', message, title }),
    error: (message: string, title?: string) => push({ type: 'error', message, title, timeout: 6000 }),
    info: (message: string, title?: string) => push({ type: 'info', message, title }),
    warning: (message: string, title?: string) => push({ type: 'warning', message, title }),
  }), [push]);

  const value: ToastContextType = useMemo(() => ({ items, push, remove, ...typed }), [items, push, remove, typed]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// Simple viewport renderer placed at root by provider
const ToastViewport: React.FC = () => {
  const { items, remove } = useToast();
  return (
    <div className="fixed z-[9999] right-4 bottom-4 space-y-2 w-[92vw] max-w-sm">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`animate-slide-up rounded-lg shadow-lg border px-4 py-3 text-sm flex items-start gap-3
            ${t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100' : ''}
            ${t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-100' : ''}
            ${t.type === 'info' ? 'bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-100' : ''}
            ${t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100' : ''}
          `}
        >
          <div className="pt-0.5">
            {t.type === 'success' && <i className="fa-solid fa-circle-check" aria-hidden="true"></i>}
            {t.type === 'error' && <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>}
            {t.type === 'info' && <i className="fa-solid fa-circle-info" aria-hidden="true"></i>}
            {t.type === 'warning' && <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>}
          </div>
          <div className="flex-1">
            {t.title && <p className="font-semibold mb-0.5">{t.title}</p>}
            <p className="leading-snug opacity-90">{t.message}</p>
          </div>
          <button aria-label="Fermer" onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      ))}
    </div>
  );
};
