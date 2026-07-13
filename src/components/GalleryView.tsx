"use client";
import React, { useState } from 'react';
import { Camera, ZoomIn, Eye, Image as ImageIcon } from 'lucide-react';
import type { GalleryImage } from '@/types';
import { CustomLightbox } from '@/components/CustomLightbox';
import Base64Image from '@/components/Base64Image';

interface GalleryViewProps { gallery: GalleryImage[]; }

export const GalleryView: React.FC<GalleryViewProps> = ({ gallery }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const activeItems = gallery.filter(item => {
    if (activeCategory === 'all') return item.is_active;
    return item.is_active && item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const categories = ['all', ...Array.from(new Set(gallery.map(item => item.category).filter(Boolean)))];

  const handleImageClick = (idx: number) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-16 py-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Gallery</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent leading-tight">Campus Life & Practical Media</h1>
        <p className="text-gray-500 text-sm md:text-base">Browse raw photos from our cocktail shake-ups, barista texturing tests, and hotel service mockup halls.</p>
      </section>

      <section className="flex flex-wrap gap-2.5 justify-center">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>
            {cat === 'all' ? 'All Photos' : cat}
          </button>
        ))}
      </section>

      <section className="space-y-10">
        {activeItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeItems.map((item, idx) => (
              <div key={item.id} onClick={() => handleImageClick(idx)} className="group relative aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100">
                {item.url ? (
                  <Base64Image base64={item.url} alt={item.alt_text || 'Gallery image'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all p-5 flex flex-col justify-between">
                  <span className="self-start text-[9px] font-bold tracking-wider text-secondary uppercase bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">{item.category}</span>
                  <div className="flex items-center gap-2 justify-center text-white/90 scale-75 group-hover:scale-100 transition-transform duration-300"><ZoomIn className="w-5 h-5 text-secondary" /><span className="text-xs font-semibold">View Photo</span></div>
                  <p className="text-white text-xs leading-snug line-clamp-2 mt-auto">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-700">No media found</h3>
            <p className="text-gray-500 text-xs mt-1">Try choosing another media category.</p>
          </div>
        )}
      </section>

      <CustomLightbox images={activeItems} currentIndex={lightboxIndex} isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} onNavigate={(newIdx) => setLightboxIndex(newIdx)} />
    </div>
  );
};