import Image from 'next/image';

interface SmartImageProps {
  src?: string | null;
  base64?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
}

const ALLOWED_HOSTS = [
  'images.unsplash.com',
  'plus.unsplash.com',
  'supabase.skylineimbh.com',
  'supabase.co',
  'maps.googleapis.com',
  'www.google.com',
];

// Google Maps URLs ke liye helper function
function isGoogleMapsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.google.com' && urlObj.pathname.startsWith('/maps/');
  } catch {
    return false;
  }
}

export default function SmartImage({
  src,
  base64,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  fallback = '/placeholder.jpg',
}: SmartImageProps) {
  let finalSrc: string;
  let useNextImage = false;
  let unoptimized = false;

  const raw = src || base64;

  if (raw) {
    if (raw.startsWith('data:')) {
      finalSrc = raw;
      useNextImage = false;
    } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const url = new URL(raw);
        // Google Maps URLs ke liye unoptimized true karein
        if (isGoogleMapsUrl(raw)) {
          useNextImage = true;
          unoptimized = true;
        } else {
          useNextImage = ALLOWED_HOSTS.some(host => url.hostname.endsWith(host));
        }
      } catch {
        useNextImage = false;
      }
      finalSrc = raw;
    } else {
      // pure base64 without prefix
      finalSrc = `data:image/jpeg;base64,${raw}`;
      useNextImage = false;
    }
  } else {
    finalSrc = fallback;
    useNextImage = false;
  }

  if (useNextImage) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}