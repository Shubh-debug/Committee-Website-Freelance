/** Format an ISO date as a friendly Marathi/English date, e.g. "१६ ऑगस्ट २०२६" style fallback. */
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

export function todayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function currentYearStartValue() {
  return `${new Date().getFullYear()}-01-01`;
}

export function formatIndianPhone(phone) {
  if (!phone) return '—';
  const digits = normalizeIndianPhone(phone);
  return /^[6-9]\d{9}$/.test(digits) ? `+91 ${digits}` : phone;
}

export function normalizeIndianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '🙏';
}

export function timeAgo(iso) {
  if (!iso) return '';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(iso);
}

/** Relative day label for event cards. */
export function eventDayLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T00:00:00`);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff < 30) return `In ${diff} days`;
  return formatDate(dateStr);
}

/** Extract the public storage URL for a path, tolerant of full URLs. */
export function storageUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) return pathOrUrl;
  const p = pathOrUrl.startsWith('/') ? pathOrUrl.slice(1) : pathOrUrl;
  return `${url}/storage/v1/object/public/${p}`;
}

/** Build the public URL for an uploaded storage path (bucket 'images'). */
export function uploadToGalleryGetUrl(filePath) {
  return storageUrl(`images/${filePath}`);
}

export function uploadErrorToMessage(err) {
  return err?.message || 'Something went wrong. Please try again.';
}
