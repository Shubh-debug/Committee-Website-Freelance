/**
 * Placeholder image system — inlined SVG data URIs with an optional caption.
 * Used for every image slot (hero, Ganesha idol, mandal logo, posts, events,
 * gallery…) until real photos are uploaded via the admin panel.
 */
export function placeholder(caption = '', variant = 'default') {
  const gradients = {
    default: ['#F97316', '#7B1F24'],
    gold: ['#D4AF37', '#7B1F24'],
    maroon: ['#8E2530', '#2A0A0E'],
    saffron: ['#FB923C', '#C2410C'],
  };
  const [c1, c2] = gradients[variant] || gradients.default;
  const safe =
    caption.replace(/[<>&]/g, '').slice(0, 96) || 'श्री गणेश मित्र मंडळ 2026';
  const om = '<text x="50%" y="42%" font-size="52" text-anchor="middle" fill="rgba(255,255,255,0.28)">🪔</text>';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs>
    <rect width='1200' height='800' fill='url(#g)'/>
    <g fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='2'>
      <circle cx='600' cy='360' r='300'/><circle cx='600' cy='360' r='240' stroke-dasharray='6 10'/>
      <circle cx='600' cy='360' r='180'/><circle cx='600' cy='360' r='120' stroke-dasharray='4 8'/>
      <circle cx='600' cy='360' r='60'/></g>
    ${om}
    <text x='50%' y='62%' font-family='Georgia,serif' font-size='40' text-anchor='middle' fill='#FFFFFF'>${safe}</text>
    <text x='50%' y='70%' font-family='Georgia,serif' font-size='22' text-anchor='middle' fill='rgba(255,255,255,0.75)'>गणपती बाप्पा मोरया</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Alt text that keeps screen readers sane. */
export const GANESHA_IDOL_ALT = 'Lord Ganesha idol placeholder — replace with festival photo';
export const LOGO_ALT = 'Mandal logo placeholder — upload the official logo';
