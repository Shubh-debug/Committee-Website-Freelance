import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

export default function ExportMenu({ kind, year, showToast }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (event) => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, []);

  const exportFile = async (selectedFormat) => {
    setOpen(false);
    setFormat(selectedFormat);
    try {
      const blob = await api.exportFinance(kind, year, selectedFormat);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ganesh_Mitra_Mandal_${kind[0].toUpperCase()}${kind.slice(1)}_${year}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast(`${kind === 'funds' ? 'Funds' : 'Expenses'} ${selectedFormat.toUpperCase()} exported successfully.`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setFormat('');
    }
  };

  return <div ref={menuRef} className="relative shrink-0">
    <button type="button" disabled={Boolean(format)} onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open} className="input flex !w-auto items-center gap-2 !py-2 font-semibold text-maroon-800 disabled:cursor-wait disabled:opacity-60">
      {format ? `Generating ${format.toUpperCase()}...` : 'Export'}
      {!format && <span aria-hidden="true" className="text-xs">▼</span>}
    </button>
    {open && !format && <div role="menu" className="absolute right-0 top-full z-20 mt-2 min-w-32 rounded-xl border border-saffron-200 bg-cream-50 p-1 shadow-lg">
      {['pdf', 'csv'].map((option) => <button key={option} type="button" role="menuitem" onClick={() => exportFile(option)} className="block w-full rounded-lg px-4 py-2 text-left text-sm font-semibold uppercase text-maroon-800 hover:bg-saffron-100 focus:bg-saffron-100 focus:outline-none">{option}</button>)}
    </div>}
  </div>;
}