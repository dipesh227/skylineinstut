import Base64Image from '@/components/Base64Image';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, fallbackSrc }) => {
  // If src is a base64 string, use Base64Image; otherwise regular img
  if (src && (src.startsWith('data:') || src.startsWith('http'))) {
    if (src.startsWith('data:')) {
      return <Base64Image base64={src} alt={alt} className={className} />;
    }
    return <img src={src} alt={alt} className={className} />;
  }
  if (fallbackSrc) return <img src={fallbackSrc} alt={alt} className={className} />;
  return <div className={`bg-gray-200 flex items-center justify-center text-gray-400 text-xs ${className}`}>No Image</div>;
};