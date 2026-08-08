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
  let unoptimized = false;

  if (!base64) {
    src = fallback || '/placeholder.jpg';
  } else if (base64.startsWith('data:')) {
    // Already a data URI – keep as is, but we could render an <img> instead of Image for data URIs if needed
    src = base64;
    unoptimized = true;
  } else if (base64.startsWith('http://') || base64.startsWith('https://')) {
    // External URL – let Next.js optimize it
    src = base64;
    unoptimized = false;
  } else {
    // Pure base64
    src = `data:${mimeType};base64,${base64}`;
    unoptimized = true;
  }

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