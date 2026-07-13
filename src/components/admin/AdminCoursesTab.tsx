"use client";
import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown, ListPlus } from 'lucide-react';
import { Course } from '@/types';
import { useToast } from '@/components/Toast';

interface AdminCoursesTabProps { courses: Course[]; onSaveCourses: (updated: Course[]) => void; }

export const AdminCoursesTab: React.FC<AdminCoursesTabProps> = ({ courses, onSaveCourses }) => {
  const { showToast } = useToast();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState(''); const [slug, setSlug] = useState(''); const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState(''); const [duration, setDuration] = useState(''); const [fee, setFee] = useState('');
  const [feeNumeric, setFeeNumeric] = useState(''); const [badge, setBadge] = useState(''); const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [curriculum, setCurriculum] = useState<{ heading: string; items: string[] }[]>([]);

  const handleBase64FileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 1.5) { showToast('Image must be less than 1.5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); showToast('Image encoded', 'success'); };
    reader.onerror = () => showToast('Error converting image', 'error');
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle(''); setSlug(''); setShortDesc(''); setFullDesc(''); setDuration('2 Months'); setFee('₹35,000');
    setFeeNumeric('35000'); setBadge(''); setThumbnailUrl('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80');
    setIsActive(true); setCurriculum([{ heading: 'Module 1: Foundations', items: ['Basic tool handling'] }]);
  };

  const handleOpenAdd = () => { resetForm(); setIsAdding(true); setEditingCourse(null); };
  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course); setTitle(course.title); setSlug(course.slug);
    setShortDesc(course.short_description); setFullDesc(course.full_description);
    setDuration(course.duration); setFee(course.fee); setFeeNumeric(course.fee_numeric.toString());
    setBadge(course.badge || ''); setThumbnailUrl(course.thumbnail_url);
    setIsActive(course.is_active); setCurriculum(course.curriculum || []);
    setIsAdding(false);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingCourse) setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-'));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const sorted = [...courses].sort((a,b) => a.display_order - b.display_order);
    const target = direction === 'up' ? index-1 : index+1;
    if (target<0 || target>=sorted.length) return;
    [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
    sorted.forEach((c, idx) => c.display_order = idx+1);
    onSaveCourses(sorted);
    showToast('Order updated', 'success');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !shortDesc.trim()) { showToast('Fill required fields', 'error'); return; }
    const cleanCurriculum = curriculum.map(m => ({ heading: m.heading.trim(), items: m.items.map(i => i.trim()).filter(Boolean) })).filter(m => m.heading && m.items.length);
    const feeNum = parseFloat(feeNumeric) || 0;
    if (isAdding) {
      if (courses.some(c => c.slug === slug.trim())) { showToast('Slug already exists', 'error'); return; }
      const newCourse: Course = {
        id: `course-${Date.now()}`, title: title.trim(), slug: slug.trim(), short_description: shortDesc.trim(),
        full_description: fullDesc.trim() || shortDesc.trim(), duration: duration.trim(), fee: fee.trim(),
        fee_numeric: feeNum, badge: badge.trim() || undefined, thumbnail_url: thumbnailUrl.trim(),
        display_order: courses.length+1, is_active: isActive, curriculum: cleanCurriculum, created_at: new Date().toISOString()
      };
      onSaveCourses([...courses, newCourse]);
      showToast('Program published!', 'success');
      setIsAdding(false);
    } else if (editingCourse) {
      const updated = courses.map(c => c.id === editingCourse.id ? { ...c, title: title.trim(), slug: slug.trim(), short_description: shortDesc.trim(), full_description: fullDesc.trim(), duration: duration.trim(), fee: fee.trim(), fee_numeric: feeNum, badge: badge.trim() || undefined, thumbnail_url: thumbnailUrl.trim(), is_active: isActive, curriculum: cleanCurriculum } : c);
      onSaveCourses(updated);
      showToast('Program updated', 'success');
      setEditingCourse(null);
    }
  };

  const handleDelete = (id: string, label: string) => {
    if (window.confirm(`Delete "${label}"?`)) { onSaveCourses(courses.filter(c => c.id !== id)); showToast('Deleted', 'success'); }
  };

  const sortedCourses = [...courses].sort((a,b) => a.display_order - b.display_order);

  const curriculumHandlers = {
    addModule: () => setCurriculum([...curriculum, { heading: '', items: [''] }]),
    removeModule: (idx: number) => setCurriculum(curriculum.filter((_,i)=>i!==idx)),
    headingChange: (idx: number, val: string) => { const u = [...curriculum]; u[idx].heading = val; setCurriculum(u); },
    addItem: (mIdx: number) => { const u = [...curriculum]; u[mIdx].items.push(''); setCurriculum(u); },
    removeItem: (mIdx: number, iIdx: number) => { const u = [...curriculum]; u[mIdx].items = u[mIdx].items.filter((_,i)=>i!==iIdx); setCurriculum(u); },
    itemChange: (mIdx: number, iIdx: number, val: string) => { const u = [...curriculum]; u[mIdx].items[iIdx] = val; setCurriculum(u); },
  };

  return (
    <div className="space-y-6 text-left animate-slide-in">
      {!isAdding && !editingCourse && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">Manage Training Programs</h2>
            <p className="text-xs text-gray-500 mt-1">Configure active courses, edit syllabuses, reorder display.</p>
          </div>
          <button onClick={handleOpenAdd} className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
            <PlusCircle className="w-4.5 h-4.5 text-secondary" /> Add New Course
          </button>
        </div>
      )}

      {(isAdding || editingCourse) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">{isAdding ? 'Create Course' : `Editing: ${editingCourse?.title}`}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Configure pricing, descriptions, and syllabus modules.</p>
            </div>
            <button onClick={() => { setIsAdding(false); setEditingCourse(null); }} className="text-xs text-gray-400 hover:text-white">Back to List</button>
          </div>
          <form onSubmit={handleSaveSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b">1. Program Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title *</label><input type="text" required value={title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Slug *</label><input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-mono" /></div>
              </div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Short Description *</label><input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Description</label><textarea rows={4} value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs resize-none" /></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Duration</label><input type="text" required value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fee Label</label><input type="text" required value={fee} onChange={(e) => setFee(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fee Numeric</label><input type="number" required value={feeNumeric} onChange={(e) => setFeeNumeric(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-mono" /></div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Badge</label><input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
              </div>
              {/* Thumbnail */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-gray-700 uppercase">Cover Image</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2"><input type="text" required value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl text-[10px] font-mono" /></div>
                  <div><input type="file" accept="image/*" onChange={(e) => handleBase64FileChange(e, setThumbnailUrl)} className="block w-full text-[9px] file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-primary file:text-white cursor-pointer" /></div>
                </div>
                {thumbnailUrl && <div className="w-36 h-20 rounded-lg overflow-hidden border"><img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" /></div>}
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4.5 h-4.5" /><label className="text-xs font-bold text-gray-700">Show active on site</label></div>
            </div>

            {/* Curriculum */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">2. Syllabus Modules</h4>
                <button type="button" onClick={curriculumHandlers.addModule} className="px-3 py-1 bg-gray-50 border rounded-lg text-[10px] font-bold flex items-center gap-1"><ListPlus className="w-3.5 h-3.5" /> Add Block</button>
              </div>
              {curriculum.map((mod, modIdx) => (
                <div key={modIdx} className="p-4 bg-gray-50 rounded-xl border space-y-3 relative">
                  <button type="button" onClick={() => curriculumHandlers.removeModule(modIdx)} className="absolute top-3 right-3 text-rose-500 text-xs font-bold">Delete</button>
                  <div><label className="text-[9px] font-bold text-gray-400 uppercase">Heading</label><input type="text" required value={mod.heading} onChange={(e) => curriculumHandlers.headingChange(modIdx, e.target.value)} className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold" /></div>
                  <div className="space-y-2"><span className="text-[9px] font-bold text-gray-400 uppercase">Sub topics</span>
                    {mod.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex gap-2 items-center"><input type="text" required value={item} onChange={(e) => curriculumHandlers.itemChange(modIdx, itemIdx, e.target.value)} className="flex-1 px-3 py-1.5 bg-white border rounded-lg text-xs" /><button type="button" onClick={() => curriculumHandlers.removeItem(modIdx, itemIdx)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button></div>
                    ))}
                    <button type="button" onClick={() => curriculumHandlers.addItem(modIdx)} className="text-[10px] text-primary font-bold">+ Add Bullet</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3.5 pt-4 border-t">
              <button type="button" onClick={() => { setIsAdding(false); setEditingCourse(null); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs">{isAdding ? 'Publish' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {!isAdding && !editingCourse && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
              <tr><th className="py-3.5 px-4">Order</th><th className="py-3.5 px-4">Program</th><th className="py-3.5 px-4 text-center">Duration</th><th className="py-3.5 px-4 text-center">Fee</th><th className="py-3.5 px-4 text-center">Modules</th><th className="py-3.5 px-4 text-center">Status</th><th className="py-3.5 px-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {sortedCourses.length > 0 ? sortedCourses.map((c, idx) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4"><div className="flex items-center gap-1.5"><span className="font-bold">{c.display_order}</span><div className="flex flex-col gap-0.5"><button onClick={() => handleMove(idx, 'up')} disabled={idx===0} className="p-1 bg-gray-50 rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button><button onClick={() => handleMove(idx, 'down')} disabled={idx===sortedCourses.length-1} className="p-1 bg-gray-50 rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button></div></div></td>
                  <td className="py-3.5 px-4"><div className="flex items-center gap-3"><img src={c.thumbnail_url} className="w-10 h-10 rounded-lg object-cover border" /><div><span className="font-bold">{c.title}</span><span className="text-gray-400 text-[10px] font-mono block">/{c.slug}</span></div></div></td>
                  <td className="py-3.5 px-4 text-center font-semibold">{c.duration}</td>
                  <td className="py-3.5 px-4 text-center font-bold">{c.fee}</td>
                  <td className="py-3.5 px-4 text-center font-mono">{(c.curriculum||[]).length} modules</td>
                  <td className="py-3.5 px-4 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>{c.is_active ? 'Active' : 'Hidden'}</span></td>
                  <td className="py-3.5 px-4 text-right"><div className="inline-flex gap-1"><button onClick={() => handleOpenEdit(c)} className="p-1.5 text-gray-400 hover:text-primary"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(c.id, c.title)} className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              )) : <tr><td colSpan={7} className="py-14 text-center text-gray-400">No courses defined.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};