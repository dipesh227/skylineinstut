"use client";
import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryImage } from '@/types';
import Base64Image from '@/components/Base64Image';

interface CustomLightboxProps { images: GalleryImage[]; currentIndex: number; isOpen: boolean; onClose: () => void; onNavigate: (index: number) => void; }

export const CustomLightbox: React.FC<CustomLightboxProps> = ({ images, currentIndex, isOpen, onClose, onNavigate }) => {
  const current = images[currentIndex];
  const prev = useCallback(() => onNavigate((currentIndex - 1 + images.length) % images.length), [currentIndex, images.length, onNavigate]);
  const next = useCallback(() => onNavigate((currentIndex + 1) % images.length), [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, prev, next]);

  if (!isOpen || !current) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={onClose}>
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="text-white text-sm">Category: <span className="text-secondary font-semibold">{current.category}</span> | {currentIndex+1}/{images.length}</div>
        <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><X className="w-6 h-6" /></button>
      </div>
      <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <button onClick={prev} className="absolute left-4 z-10 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-3 rounded-full"><ChevronLeft className="w-6 h-6" /></button>
        <div className="max-w-full max-h-full">
          {current.url ? (
            <Base64Image base64={current.url} alt={current.alt_text || ''} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-white/10" />
          ) : (
            <div className="bg-gray-800 text-white p-8 rounded">No Image</div>
          )}
        </div>
        <button onClick={next} className="absolute right-4 z-10 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-3 rounded-full"><ChevronRight className="w-6 h-6" /></button>
      </div>
      <div className="w-full max-w-3xl p-6 text-center bg-black/50 rounded-xl mx-4 border border-white/5" onClick={e => e.stopPropagation()}>
        {current.caption && <p className="text-white text-sm md:text-base leading-relaxed">{current.caption}</p>}
        {current.alt_text && <p className="text-gray-400 text-xs mt-2 italic font-mono">Alt: {current.alt_text}</p>}
      </div>
    </div>
  );
};