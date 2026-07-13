"use client";
import { useState } from "react";
import { CustomLightbox } from "@/components/CustomLightbox";
import Base64Image from "@/components/Base64Image";
import { GalleryImage } from "@/types";

interface GalleryPageClientProps { images: GalleryImage[]; }

export function GalleryPageClient({ images }: GalleryPageClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Campus Vibe</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent">Photo Gallery</h1>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto">Explore our state-of-the-art training labs and event highlights.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img, idx) => (
          <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group bg-gray-100 shadow-md cursor-pointer" onClick={() => openLightbox(idx)}>
            {img.url ? (
              <Base64Image base64={img.url} alt={img.alt_text || "Gallery"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <span className="text-secondary text-xs font-bold uppercase">{img.category}</span>
              <p className="text-white text-sm font-semibold mt-1">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>
      <CustomLightbox images={images} currentIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} onNavigate={setLightboxIndex} />
    </div>
  );
}