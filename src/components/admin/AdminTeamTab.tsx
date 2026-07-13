"use client";
import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { TeamMember } from '@/types';
import { useToast } from '@/components/Toast';

interface AdminTeamTabProps { team: TeamMember[]; onSaveTeam: (updated: TeamMember[]) => void; }

export const AdminTeamTab: React.FC<AdminTeamTabProps> = ({ team, onSaveTeam }) => {
  const { showToast } = useToast();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState(''); const [role, setRole] = useState(''); const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState(''); const [isActive, setIsActive] = useState(true);
  const [facebook, setFacebook] = useState(''); const [instagram, setInstagram] = useState(''); const [linkedin, setLinkedin] = useState('');

  const handleBase64 = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0]; if(!file) return;
    if(file.size > 1024*1024*1.5) { showToast('Image too large','error'); return; }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); showToast('Photo encoded','success'); };
    reader.onerror = () => showToast('Error','error');
    reader.readAsDataURL(file);
  };

  const resetForm = () => { setName(''); setRole(''); setBio(''); setImageUrl(''); setIsActive(true); setFacebook(''); setInstagram(''); setLinkedin(''); };

  const handleOpenAdd = () => { resetForm(); setIsAdding(true); setEditingMember(null); };
  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m); setName(m.name); setRole(m.role); setBio(m.bio); setImageUrl(m.image_url); setIsActive(m.is_active);
    setFacebook(m.socials.facebook||''); setInstagram(m.socials.instagram||''); setLinkedin(m.socials.linkedin||'');
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name.trim() || !role.trim() || !bio.trim()) { showToast('Fill required fields','error'); return; }
    const socials = { facebook: facebook.trim() || undefined, instagram: instagram.trim() || undefined, linkedin: linkedin.trim() || undefined };
    if(isAdding) {
      const newMember: TeamMember = { id: `member-${Date.now()}`, name: name.trim(), role: role.trim(), bio: bio.trim(), image_url: imageUrl.trim(), display_order: team.length+1, is_active: isActive, socials };
      onSaveTeam([...team, newMember]);
      showToast('Coach added','success');
      setIsAdding(false);
    } else if(editingMember) {
      const updated = team.map(item => item.id === editingMember.id ? { ...item, name: name.trim(), role: role.trim(), bio: bio.trim(), image_url: imageUrl.trim(), is_active: isActive, socials } : item);
      onSaveTeam(updated);
      showToast('Profile updated','success');
      setEditingMember(null);
    }
  };

  const handleDelete = (id: string, label: string) => {
    if(window.confirm(`Delete "${label}"?`)) { onSaveTeam(team.filter(item => item.id !== id)); showToast('Removed','success'); }
  };

  const handleMove = (index: number, direction: 'up'|'down') => {
    const sorted = [...team].sort((a,b) => a.display_order - b.display_order);
    const target = direction==='up' ? index-1 : index+1;
    if(target<0 || target>=sorted.length) return;
    [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
    sorted.forEach((item, idx) => item.display_order = idx+1);
    onSaveTeam(sorted);
    showToast('Order updated','success');
  };

  const sortedTeam = [...team].sort((a,b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6 text-left animate-slide-in">
      {!isAdding && !editingMember && (
        <div className="flex justify-between items-center">
          <div><h2 className="text-xl font-bold font-heading text-slate-900">Manage Coaching Faculty</h2><p className="text-xs text-gray-500">Configure instructors, upload photos, link social media.</p></div>
          <button onClick={handleOpenAdd} className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1.5"><PlusCircle className="w-4 h-4 text-secondary" /> Add Coach</button>
        </div>
      )}
      {(isAdding || editingMember) && (
        <div className="bg-white rounded-2xl border p-6 max-w-2xl">
          <h3 className="text-base font-bold mb-4">{isAdding ? 'Create Coach Profile' : `Editing: ${editingMember?.name}`}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold">Full Name *</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
              <div><label className="text-xs font-bold">Title/Role *</label><input type="text" required value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold">Photo</span>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2"><input type="text" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" /></div>
                <div><input type="file" accept="image/*" onChange={(e) => handleBase64(e, setImageUrl)} className="block w-full text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-primary file:text-white cursor-pointer" /></div>
              </div>
              {imageUrl && <div className="w-12 h-12 rounded-full overflow-hidden border"><img src={imageUrl} className="w-full h-full object-cover" /></div>}
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /><label className="text-xs font-bold">Show active on site</label></div>
            <div><label className="text-xs font-bold">Biography *</label><textarea required rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs resize-none" /></div>
            <div className="space-y-3 pt-3 border-t">
              <h4 className="text-xs font-bold text-primary uppercase">Social Handles (Optional)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-[9px] text-gray-400">Instagram</label><input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono" /></div>
                <div><label className="text-[9px] text-gray-400">LinkedIn</label><input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono" /></div>
                <div><label className="text-[9px] text-gray-400">Facebook</label><input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono" /></div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => { setIsAdding(false); setEditingMember(null); }} className="flex-1 py-2 border rounded-xl text-xs">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase"><tr><th className="py-3 px-4">Order</th><th className="py-3 px-4">Coach</th><th className="py-3 px-4">Role</th><th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {sortedTeam.length===0 ? <tr><td colSpan={5} className="py-14 text-center text-gray-400">No profiles defined.</td></tr> :
              sortedTeam.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4"><div className="flex items-center gap-1.5"><span className="font-bold">{item.display_order}</span><div className="flex flex-col gap-0.5"><button onClick={() => handleMove(idx, 'up')} disabled={idx===0} className="p-1 bg-gray-50 rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button><button onClick={() => handleMove(idx, 'down')} disabled={idx===sortedTeam.length-1} className="p-1 bg-gray-50 rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button></div></div></td>
                  <td className="py-3 px-4"><div className="flex items-center gap-3"><img src={item.image_url} className="w-10 h-10 rounded-full object-cover border" /><span className="font-bold">{item.name}</span></div></td>
                  <td className="py-3 px-4 font-semibold">{item.role}</td>
                  <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.is_active?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-400'}`}>{item.is_active?'Active':'Hidden'}</span></td>
                  <td className="py-3 px-4 text-right"><div className="inline-flex gap-1"><button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-400 hover:text-primary"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(item.id, item.name)} className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};