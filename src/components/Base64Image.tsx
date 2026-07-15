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
  // Determine the source
  let src: string;
  if (!base64) {
    src = fallback || '/placeholder.jpg';
  } else if (base64.startsWith('data:')) {
    // Already a data URI
    src = base64;
  } else if (base64.startsWith('http://') || base64.startsWith('https://')) {
    // It's a regular URL – use it directly
    src = base64;
  } else {
    // Assume pure base64 and add the data URI prefix
    src = `data:${mimeType};base64,${base64}`;
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
      unoptimized
    />
  );
}