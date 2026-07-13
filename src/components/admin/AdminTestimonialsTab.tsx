"use client";
import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, Star } from 'lucide-react';
import { Testimonial, Course } from '@/types';
import { useToast } from '@/components/Toast';

interface AdminTestimonialsTabProps { testimonials: Testimonial[]; courses: Course[]; onSaveTestimonials: (updated: Testimonial[]) => void; }

export const AdminTestimonialsTab: React.FC<AdminTestimonialsTabProps> = ({ testimonials, courses, onSaveTestimonials }) => {
  const { showToast } = useToast();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState(''); const [courseTitle, setCourseTitle] = useState(''); const [rating, setRating] = useState(5);
  const [text, setText] = useState(''); const [placementHotel, setPlacementHotel] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setName(''); setCourseTitle(courses[0]?.title||''); setRating(5); setText(''); setPlacementHotel('');
    setAvatarUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80'); setIsActive(true);
    setIsAdding(true); setEditingTestimonial(null);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingTestimonial(t); setName(t.student_name); setCourseTitle(t.course_name); setRating(t.rating);
    setText(t.text); setPlacementHotel(t.placement_hotel||''); setAvatarUrl(t.photo_url||''); setIsActive(t.is_active);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name.trim() || !text.trim() || !courseTitle.trim()) { showToast('Fill required fields','error'); return; }
    if(isAdding) {
      const newTesti: Testimonial = { id: `t-${Date.now()}`, student_name: name.trim(), course_name: courseTitle.trim(), course_id: courses.find(c=>c.title===courseTitle)?.id||'', rating, text: text.trim(), placement_hotel: placementHotel.trim()||undefined, photo_url: avatarUrl.trim(), display_order: testimonials.length+1, is_active: isActive, created_at: new Date().toISOString() };
      onSaveTestimonials([...testimonials, newTesti]);
      showToast('Testimonial created','success');
      setIsAdding(false);
    } else if(editingTestimonial) {
      const updated = testimonials.map(t => t.id===editingTestimonial.id ? {...t, student_name: name.trim(), course_name: courseTitle.trim(), course_id: courses.find(c=>c.title===courseTitle)?.id||'', rating, text: text.trim(), placement_hotel: placementHotel.trim()||undefined, photo_url: avatarUrl.trim(), is_active: isActive} : t);
      onSaveTestimonials(updated);
      showToast('Updated','success');
      setEditingTestimonial(null);
    }
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Delete?')) { onSaveTestimonials(testimonials.filter(t => t.id!==id)); showToast('Removed','success'); }
  };

  const toggleStatus = (item: Testimonial) => {
    const updated = testimonials.map(t => t.id===item.id ? {...t, is_active:!t.is_active} : t);
    onSaveTestimonials(updated);
  };

  return (
    <div className="space-y-6 text-left animate-slide-in">
      {!isAdding && !editingTestimonial && (
        <div className="flex justify-between items-center">
          <div><h2 className="text-xl font-bold font-heading text-slate-900">Student Reviews & Placements</h2><p className="text-xs text-gray-500">Manage alumni reviews, placements, ratings.</p></div>
          <button onClick={handleOpenAdd} className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1.5"><PlusCircle className="w-4 h-4 text-secondary" /> Add Review</button>
        </div>
      )}
      {(isAdding || editingTestimonial) && (
        <div className="bg-white rounded-2xl border p-6 max-w-2xl">
          <h3 className="text-base font-bold mb-4">{isAdding?'Add Student Review':'Edit Testimonial'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold">Student Name *</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
              <div><label className="text-xs font-bold">Training Program *</label><select value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs"><option value="">Select Course</option>{courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs font-bold">Rating (1-5)</label><input type="number" min="1" max="5" required value={rating} onChange={(e) => setRating(parseInt(e.target.value)||5)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" /></div>
              <div className="col-span-2"><label className="text-xs font-bold">Placement Hotel</label><input type="text" value={placementHotel} onChange={(e) => setPlacementHotel(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
            </div>
            <div><label className="text-xs font-bold">Avatar Photo URL</label><input type="text" required value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /><label className="text-xs font-bold">Show on home page</label></div>
            <div><label className="text-xs font-bold">Feedback Quote *</label><textarea required rows={4} value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs resize-none" /></div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => { setIsAdding(false); setEditingTestimonial(null); }} className="flex-1 py-2 border rounded-xl text-xs">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold">Save Review</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <img src={t.photo_url} alt={t.student_name} className="w-10 h-10 rounded-full object-cover border" />
              <div><h4 className="text-xs font-bold text-gray-900">{t.student_name}</h4><span className="text-[10px] font-bold text-primary">{t.course_name}</span></div>
            </div>
            <div className="flex gap-1">{Array.from({length: t.rating}).map((_,i)=><Star key={i} className="w-3.5 h-3.5 text-secondary fill-secondary"/>)}</div>
            <p className="text-gray-600 text-xs italic">“{t.text}”</p>
            {t.placement_hotel && <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[10px] font-bold uppercase">🎉 {t.placement_hotel}</div>}
            <div className="flex justify-between items-center pt-3 border-t">
              <button onClick={() => toggleStatus(t)} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${t.is_active?'bg-primary/10 text-primary':'bg-gray-50 text-gray-400'}`}>{t.is_active?'Shown':'Hidden'}</button>
              <div className="flex gap-1">
                <button onClick={() => handleOpenEdit(t)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};