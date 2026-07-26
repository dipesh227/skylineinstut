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
  let useNextImage = true;

  if (!base64) {
    src = fallback || '/placeholder.jpg';
  } else if (base64.startsWith('data:')) {
    src = base64;
    useNextImage = false; // data URIs must be unoptimized
  } else if (base64.startsWith('http://') || base64.startsWith('https://')) {
    // For URLs, only use next/image if the host is known (e.g., Unsplash, Supabase)
    const allowedHosts = [
      'images.unsplash.com',
      'plus.unsplash.com',
      'supabase.skylineimbh.com',
      'supabase.co',
      'localhost',
    ];
    const url = new URL(base64);
    if (!allowedHosts.some(host => url.hostname.endsWith(host))) {
      // For external/non‑image hosts, use a plain <img> to avoid errors
      src = base64;
      useNextImage = false;
    } else {
      src = base64;
      useNextImage = true;
    }
  } else {
    // Pure base64
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
      />
    );
  }

  // Fallback: plain <img> for unsupported hosts or data URIs
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