import { createContext, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);
const TOAST_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));
  const showToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    return id;
  };

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-20" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  const close = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(onDismiss, 180);
  };

  useEffect(() => {
    const timer = window.setTimeout(close, TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, []);

  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${exiting ? 'anim-toast-out' : 'anim-toast'} ${styles[toast.type] || styles.info}`} role="status">
      <span className="flex-1">{toast.message}</span>
      <button type="button" onClick={close} className="shrink-0 text-current/60 transition hover:text-current" aria-label="Close notification">×</button>
    </div>
  );
}
