import { useState } from 'react';
import { storageUrl } from '../lib/utils.js';
import { PhotoIcon, UserIcon, CalendarIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

/**
 * <ImagePlaceholder src caption variant className imgClassName />
 * Renders the actual image if `src` exists and is valid.
 * Falls back to an elegant, quiet Ganesha watermark if `src` is missing or broken.
 */
export default function ImagePlaceholder({
  src,
  caption = 'No Image Available', 
  variant = 'default', // e.g., 'profile', 'event', 'announcement', 'default'
  className = '',
  alt = '',
  imgClassName = '',
}) {
  // State to track if the actual image failed to load
  const [hasError, setHasError] = useState(false);

  // 1. IF WE HAVE A VALID SRC AND NO ERRORS: Render the actual image
  if (src && !hasError) {
    return (
      <img
        src={storageUrl(src)}
        alt={alt || caption}
        className={`${className} ${imgClassName}`.trim()}
        loading="lazy"
        // If the image link is broken, trigger the state to switch to the fallback UI
        onError={() => setHasError(true)} 
      />
    );
  }

  // 2. IF SRC IS MISSING OR BROKEN: Render the custom UI fallback

  // Dynamically choose the icon based on the variant prop
  const Icon = 
    variant === 'profile' ? UserIcon :
    variant === 'event' ? CalendarIcon :
    variant === 'announcement' ? MegaphoneIcon :
    PhotoIcon;

  // Clean up the default caption if it was the old Marathi text, otherwise use the provided text
  const displayText = caption === 'गणपती बाप्पा मोरया 🙏' ? 'No Image' : caption;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-stone-100 border border-stone-200/60 ${className}`}
    >
      {/* The Branded Watermark (Faint Ganesha Logo) */}
      <img 
        src="/images/ganesha.png" 
        alt="" 
        className="absolute inset-0 h-full w-full object-contain p-6 opacity-[0.03] grayscale"
        aria-hidden="true"
      />
      
      {/* Contextual Icon & Text */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 p-4 text-center text-stone-400">
        <Icon className="h-8 w-8 opacity-40" strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          {displayText}
        </span>
      </div>
    </div>
  );
}