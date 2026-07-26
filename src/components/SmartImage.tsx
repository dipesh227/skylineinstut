import Image from 'next/image';

interface SmartImageProps {
  src?: string | null;           // new URL (preferred)
  base64?: string | null;        // old base64 (fallback)
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
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
  let unoptimized = false;

  if (src && (src.startsWith('http') || src.startsWith('/'))) {
    finalSrc = src;
  } else if (base64) {
    finalSrc = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    unoptimized = true;
  } else {
    finalSrc = fallback;
    unoptimized = false;
  }

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