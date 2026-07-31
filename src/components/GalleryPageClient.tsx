"use client";
import { useState } from "react";
import { CustomLightbox } from "@/components/CustomLightbox";
import Base64Image from "@/components/Base64Image";
import { GalleryImage } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Search, X } from "lucide-react";

interface GalleryPageClientProps { images: GalleryImage[]; }

export function GalleryPageClient({ images }: GalleryPageClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["all", ...Array.from(new Set(images.map(img => img.category).filter(Boolean)))] as string[];

  const filtered = images.filter(img => {
    if (!img.is_active) return false;
    if (activeCategory !== "all" && img.category !== activeCategory) return false;
    if (searchTerm && !img.caption?.toLowerCase().includes(searchTerm.toLowerCase()) && !img.category?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Campus Vibe</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent">Photo Gallery</h1>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto">Explore our state-of-the-art training labs, events, and student life.</p>
      </div>

      {/* Category filters & search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                activeCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {cat === 'all' ? 'All Photos' : cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search photos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid with masonry-like effect */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filtered.map((img, idx) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative group aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() => openLightbox(idx)}
            >
              {img.url ? (
                <Base64Image base64={img.url} alt={img.alt_text || "Gallery"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <span className="text-secondary text-xs font-bold uppercase tracking-wider">{img.category}</span>
                <p className="text-white text-sm font-semibold mt-1 leading-snug">{img.caption || 'Skyline Institute'}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-white/60" />
                  <span className="text-white/60 text-xs">Click to expand</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No photos found matching your criteria.</p>
        </div>
      )}

      <CustomLightbox images={filtered} currentIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} onNavigate={setLightboxIndex} />
    </div>
  );
}