/**
 * Section heading — eyebrow + title + optional subtitle, centered by default.
 */
export default function Section({ eyebrow, title, subtitle, align = 'center', theme = 'default' }) {
  const alignCls = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  const eyebrowCls =
    theme === 'light'
      ? 'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-300'
      : 'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-saffron-600';
  const titleCls = theme === 'light' ? 'section-heading text-cream-100' : 'section-heading';
  const subtitleCls =
    theme === 'light' ? 'max-w-2xl text-sm text-cream-100/90 sm:text-base' : 'max-w-2xl text-sm text-stone-600 sm:text-base';

  return (
    <div className={`mb-10 flex flex-col gap-3 ${alignCls}`}>
      {eyebrow && (
        <span className={eyebrowCls}>
          <span className="h-px w-8 bg-gold-500" />
          {eyebrow}
          <span className="h-px w-8 bg-gold-500" />
        </span>
      )}
      <h2 className={titleCls}>{title}</h2>
      {subtitle && <p className={subtitleCls}>{subtitle}</p>}
    </div>
  );
}
