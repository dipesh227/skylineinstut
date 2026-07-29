import Image from 'next/image';

interface Base64ImageProps {
  base64: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
  mimeType?: string;
}

const ALLOWED_HOSTS = [
  'images.unsplash.com',
  'plus.unsplash.com',
  'supabase.skylineimbh.com',
  'supabase.co',
  'maps.googleapis.com',
  'www.google.com',
];

function isGoogleMapsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.google.com' && urlObj.pathname.startsWith('/maps/');
  } catch {
    return false;
  }
}

export default function Base64Image({
  base64,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  fallback,
  mimeType = 'image/jpeg',
}: Base64ImageProps) {
  let src: string;
  let useNextImage = false;
  let unoptimized = false;

  if (!base64) {
    src = fallback || '/placeholder.jpg';
    useNextImage = false;
  } else if (base64.startsWith('data:')) {
    src = base64;
    useNextImage = false;
  } else if (base64.startsWith('http://') || base64.startsWith('https://')) {
    try {
      const url = new URL(base64);
      if (isGoogleMapsUrl(base64)) {
        useNextImage = true;
        unoptimized = true;
      } else {
        useNextImage = ALLOWED_HOSTS.some(host => url.hostname.endsWith(host));
      }
    } catch {
      useNextImage = false;
    }
    src = base64;
  } else {
    src = `data:${mimeType};base64,${base64}`;
    useNextImage = false;
  }

  if (useNextImage) {
    return (
      <Image
        src={src}
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
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}