"use client";
import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { GalleryImage } from '@/types';
import { useToast } from '@/components/Toast';

interface AdminGalleryTabProps { gallery: GalleryImage[]; onSaveGallery: (updated: GalleryImage[]) => void; }

export const AdminGalleryTab: React.FC<AdminGalleryTabProps> = ({ gallery, onSaveGallery }) => {
  const { showToast } = useToast();
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [url, setUrl] = useState(''); const [category, setCategory] = useState('Mixology'); const [caption, setCaption] = useState(''); const [altText, setAltText] = useState(''); const [isActive, setIsActive] = useState(true);

  const handleBase64 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    if(file.size > 1024*1024*1.5) { showToast('Image too large','error'); return; }
    const reader = new FileReader();
    reader.onload = () => { setUrl(reader.result as string); showToast('Image encoded','success'); };
    reader.onerror = () => showToast('Error','error');
    reader.readAsDataURL(file);
  };

  const resetForm = () => { setUrl(''); setCategory('Mixology'); setCaption(''); setAltText(''); setIsActive(true); };

  const handleOpenAdd = () => { resetForm(); setIsAdding(true); setEditingImage(null); };
  const handleOpenEdit = (img: GalleryImage) => {
    setEditingImage(img); setUrl(img.url); setCategory(img.category); setCaption(img.caption || ''); setAltText(img.alt_text || ''); setIsActive(img.is_active); setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if(!url.trim() || !category.trim()) { showToast('URL and Category required','error'); return; }
    if(isAdding) {
      const newImg: GalleryImage = { id: `img-${Date.now()}`, url: url.trim(), category, caption: caption.trim(), alt_text: altText.trim(), display_order: gallery.length+1, is_active: isActive, created_at: new Date().toISOString() };
      onSaveGallery([...gallery, newImg]);
      showToast('Photo added','success');
      setIsAdding(false);
    } else if(editingImage) {
      const updated = gallery.map(i => i.id===editingImage.id ? {...i, url:url.trim(), category, caption:caption.trim(), alt_text:altText.trim(), is_active:isActive} : i);
      onSaveGallery(updated);
      showToast('Updated','success');
      setEditingImage(null);
    }
  };

  const toggleStatus = (img: GalleryImage) => {
    const updated = gallery.map(i => i.id===img.id ? {...i, is_active:!i.is_active} : i);
    onSaveGallery(updated);
  };

  return (
    <div className="space-y-6 text-left animate-slide-in">
      {!isAdding && !editingImage && (
        <div className="flex justify-between items-center">
          <div><h2 className="text-xl font-bold font-heading text-slate-900">Media Gallery</h2><p className="text-xs text-gray-500">Manage photos, categories, and visibility.</p></div>
          <button onClick={handleOpenAdd} className="px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl flex items-center gap-1.5"><PlusCircle className="w-4 h-4" /> Add Photo</button>
        </div>
      )}
      {(isAdding || editingImage) && (
        <div className="bg-white p-6 rounded-2xl border max-w-2xl">
          <h3 className="text-base font-bold mb-4">{isAdding ? 'Add Photo' : 'Edit Photo'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="text-xs font-bold">Image URL / Base64 *</label><input type="text" required value={url} onChange={e => setUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /><input type="file" accept="image/*" onChange={handleBase64} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold">Category *</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs"><option>Mixology</option><option>Flair</option><option>Barista</option><option>Campus</option><option>Events</option></select></div>
              <div><label className="text-xs font-bold">Alt Text</label><input type="text" value={altText} onChange={e => setAltText(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
            </div>
            <div><label className="text-xs font-bold">Caption</label><input type="text" value={caption} onChange={e => setCaption(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /><label className="text-xs font-bold">Visible</label></div>
            <div className="flex gap-2"><button type="button" onClick={() => { setIsAdding(false); setEditingImage(null); }} className="flex-1 py-2 border rounded-xl text-xs">Cancel</button><button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold">Save</button></div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map(img => (
          <div key={img.id} className="bg-white rounded-2xl border overflow-hidden">
            <img src={img.url} alt={img.alt_text} className="w-full h-40 object-cover" />
            <div className="p-3 space-y-2">
              <p className="text-xs font-semibold">{img.category}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{img.caption || 'No caption'}</p>
              <div className="flex justify-between items-center">
                <button onClick={() => toggleStatus(img)} className={`p-1 rounded-full ${img.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>{img.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(img)} className="p-1 text-gray-400 hover:text-primary"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => { if(window.confirm('Delete?')) onSaveGallery(gallery.filter(i => i.id!==img.id)); }} className="p-1 text-gray-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};