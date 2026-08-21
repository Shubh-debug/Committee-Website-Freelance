import { createContext, useContext, useEffect, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = (options) => new Promise((resolve) => {
    setRequest({ ...options, resolve });
  });

  const close = (result) => {
    request?.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && <ConfirmDialog request={request} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return confirm;
}

function ConfirmDialog({ request, onClose }) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const confirm = async () => {
    setLoading(true);
    try {
      await request.onConfirm?.();
      onClose(true);
    } catch (error) {
      setLoading(false);
      onClose(false);
      request.onError?.(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-deep/60 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(false); }}>
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-cream-50 p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="font-display text-xl font-bold text-maroon-800">{request.title || 'Confirm Deletion'}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">{request.message}</p>
        {request.detail && <p className="mt-2 text-sm font-semibold text-maroon-800">{request.detail}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => onClose(false)} disabled={loading} className="btn-outline !px-4 !py-2 text-sm">Cancel</button>
          <button type="button" onClick={confirm} disabled={loading} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}
