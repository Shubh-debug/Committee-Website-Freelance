import { storageUrl } from '../lib/utils.js';
import { placeholder } from '../lib/placeholder.js';

/**
 * <ImagePlaceholder src caption variant … />
 * Falls back to an elegant decorative SVG when src is empty/unavailable.
 */
export default function ImagePlaceholder({
  src,
  caption = 'गणपती बाप्पा मोरया 🙏',
  variant = 'default',
  className = '',
  alt = '',
  imgClassName = '',
}) {
  if (!src) {
    return (
      <img
        src={placeholder(caption, variant)}
        alt={alt || caption}
        className={className}
        loading="lazy"
      />
    );
  }
  return (
    <img
      src={storageUrl(src)}
      alt={alt || caption}
      className={className}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = placeholder(caption, variant);
      }}
    />
  );
}
