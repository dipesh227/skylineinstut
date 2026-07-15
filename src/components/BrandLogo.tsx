import React from 'react';
import { GraduationCap } from 'lucide-react';
import Base64Image from '@/components/Base64Image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'color';
  variant?: 'full' | 'emblem';
  className?: string;
  instituteName?: string | null;
  logoBase64?: string | null;
  large?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  theme = 'color',
  variant = 'full',
  className = '',
  instituteName,
  logoBase64,
  large = false,
}) => {
  const nameStr = (instituteName || 'Skyline Institute').trim();
  const parts = nameStr.split(/\s+/);
  const firstPart = parts[0]?.toUpperCase() || 'SKYLINE';
  const secondPart = parts.slice(1, 3).join(' ').toUpperCase() || 'INSTITUTE OF MANAGEMENT,';
  const thirdPart = parts.slice(3).join(' ').toUpperCase() || 'HOSPITALITY AND BARTENDING';

  const baseSize = large ? 'lg' : size;
  const sizeMap = {
    sm: { emblem: 'w-8 h-8', text: 'text-xs' },
    md: { emblem: 'w-11 h-11', text: 'text-base md:text-lg' },
    lg: { emblem: 'w-14 h-14', text: 'text-xl' },
    xl: { emblem: 'w-20 h-20', text: 'text-2xl' },
  };
  const selected = sizeMap[baseSize];
  // 1.5x the base 'lg' size (w-14 h-14) → w-20 h-20 (80px)
  const emblemClass = large ? 'w-20 h-20' : selected.emblem;

  const colors = {
    color: { skyline: 'text-primary', sub1: 'text-secondary', sub2: 'text-secondary' },
    light: { skyline: 'text-primary', sub1: 'text-secondary', sub2: 'text-secondary' },
    dark: { skyline: 'text-white', sub1: 'text-secondary-light', sub2: 'text-secondary-light' },
  }[theme];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className} ${
      large ? 'drop-shadow-2xl scale-110 transition-all duration-500' : 'transition-all duration-500'
    }`}>
      {logoBase64 ? (
        <Base64Image
          base64={logoBase64}
          alt={nameStr}
          width={large ? 80 : baseSize === 'sm' ? 32 : baseSize === 'md' ? 44 : baseSize === 'lg' ? 56 : 80}
          height={large ? 80 : baseSize === 'sm' ? 32 : baseSize === 'md' ? 44 : baseSize === 'lg' ? 56 : 80}
          className={`${emblemClass} shrink-0 object-contain rounded-lg`}
          priority={false}
        />
      ) : (
        <svg className={`${emblemClass} shrink-0`} viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1E3A8A"/><stop offset="60%" stopColor="#0F172A"/><stop offset="100%" stopColor="#020617"/></linearGradient>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="40%" stopColor="#D4AF37"/><stop offset="100%" stopColor="#B45309"/></linearGradient>
            <linearGradient id="p" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1D4ED8"/></linearGradient>
            <linearGradient id="c" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1E40AF"/><stop offset="100%" stopColor="#172554"/></linearGradient>
          </defs>
          <path d="M12 30C5 45 5 65 18 80C13 74 9 60 13 45Z" fill="url(#g)"/>
          <path d="M28 88C48 95 72 92 86 74C74 83 54 85 34 81Z" fill="url(#g)"/>
          <circle cx="50" cy="50" r="37" fill="url(#b)" stroke="#1E3A8A" strokeWidth="1"/>
          <circle cx="50" cy="50" r="34" stroke="url(#g)" strokeWidth="0.75" strokeDasharray="140 30" fill="none" transform="rotate(-40 50 50)"/>
          <g opacity="0.9">
            <rect x="33" y="44" width="3.5" height="14" rx="0.5" fill="url(#p)"/>
            <rect x="38.5" y="34" width="3.5" height="24" rx="0.5" fill="url(#p)"/>
            <rect x="44" y="24" width="3.5" height="34" rx="0.5" fill="url(#p)"/>
            <rect x="49.5" y="15" width="3.5" height="43" rx="0.5" fill="url(#p)"/>
            <rect x="55" y="21" width="3.5" height="37" rx="0.5" fill="url(#p)"/>
            <rect x="60.5" y="29" width="3.5" height="29" rx="0.5" fill="url(#p)"/>
            <rect x="66" y="39" width="3.5" height="19" rx="0.5" fill="url(#p)"/>
          </g>
          <path d="M33 62L33 66C33 72 67 72 67 66L67 62C67 66 33 66 33 62Z" fill="#1D4ED8" stroke="#3B82F6" strokeWidth="0.5"/>
          <polygon points="50,50 83,59 50,68 17,59" fill="url(#c)" stroke="#FFFFFF" strokeWidth="1.2"/>
          <circle cx="50" cy="59" r="1.5" fill="#F59E0B"/>
          <path d="M50 59Q68 60 74 67L76 77" stroke="#F59E0B" strokeWidth="1" fill="none"/>
          <g transform="translate(74,76)"><rect x="0.5" y="0" width="1" height="2.5" fill="#E2E8F0"/><line x1="1" y1="0" x2="1" y2="-2" stroke="#94A3B8" strokeWidth="0.5"/><path d="M0 2.5C0 2 2 2 2 2.5L2 7.5C2 8 0 8 0 7.5Z" fill="#60A5FA"/><rect x="0" y="4" width="2" height="2" fill="#FFFFFF" opacity="0.7"/></g>
        </svg>
      )}

      {variant === 'full' && !large && (
        <div className="flex flex-col justify-center leading-none text-left">
          <span className={`block font-extrabold font-heading tracking-wider ${colors.skyline} ${selected.text}`}>
            {firstPart}
          </span>
          <div className="flex flex-col mt-0.5 space-y-[1px]">
            {secondPart && (
              <span className={`block font-extrabold tracking-[0.05em] ${colors.sub1} ${baseSize === 'sm' ? 'text-[6px]' : 'text-[7.5px] md:text-[8px]'}`}>
                {secondPart}
              </span>
            )}
            {thirdPart && (
              <span className={`block font-extrabold tracking-[0.04em] ${colors.sub2} ${baseSize === 'sm' ? 'text-[6px]' : 'text-[7.5px] md:text-[8px]'}`}>
                {thirdPart}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};