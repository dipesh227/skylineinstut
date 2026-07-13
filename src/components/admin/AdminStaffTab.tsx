"use client";
import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Shield, Upload, MapPin, Layers, Phone, Mail, X } from 'lucide-react';
import { StaffMember, Branch, Section } from '@/types';
import { useToast } from '@/components/Toast';

interface AdminStaffTabProps { staff: StaffMember[]; branches: Branch[]; sections: Section[]; onSaveStaff: (updated: StaffMember[]) => void; }

export const AdminStaffTab: React.FC<AdminStaffTabProps> = ({ staff, branches, sections, onSaveStaff }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'master_admin'|'hod'|'teacher'>('teacher');
  const [formBranchId, setFormBranchId] = useState('');
  const [formSectionId, setFormSectionId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSignatureBase64, setFormSignatureBase64] = useState('');

  const filteredStaff = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = !roleFilter || s.role === roleFilter;
    const matchBranch = !branchFilter || s.branch_id === branchFilter;
    return matchSearch && matchRole && matchBranch;
  });

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    if(file.size > 1024*500) { showToast('File too large','error'); return; }
    const reader = new FileReader();
    reader.onload = () => { setFormSignatureBase64(reader.result as string); showToast('Signature uploaded','success'); };
    reader.onerror = () => showToast('Error','error');
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormPassword(''); setFormRole('teacher');
    setFormBranchId(branches[0]?.id || ''); setFormSectionId(sections.filter(s => s.branch_id === branches[0]?.id)[0]?.id || '');
    setFormIsActive(true); setFormSignatureBase64('');
  };

  const handleOpenAddModal = () => { resetForm(); setEditingStaff(null); setIsModalOpen(true); };
  const handleOpenEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setFormName(member.name); setFormEmail(member.email); setFormPhone(member.phone||''); setFormPassword('');
    setFormRole(member.role); setFormBranchId(member.branch_id||''); setFormSectionId(member.section_id||'');
    setFormIsActive(member.is_active); setFormSignatureBase64(member.signature_base64||'');
    setIsModalOpen(true);
  };

  const handleSaveStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formName.trim() || !formEmail.trim() || (!editingStaff && !formPassword)) { showToast('Fill required fields','error'); return; }
    let updated: StaffMember[];
    if(editingStaff) {
      updated = staff.map(s => s.id === editingStaff.id ? { ...s, name: formName.trim(), email: formEmail.trim().toLowerCase(), phone: formPhone.trim(), role: formRole, branch_id: formRole==='master_admin'?undefined:formBranchId, section_id: formRole==='master_admin'?undefined:formSectionId, password_hash: formPassword || s.password_hash, is_active: formIsActive, signature_base64: formSignatureBase64 } : s);
    } else {
      if(staff.some(s => s.email.toLowerCase() === formEmail.trim().toLowerCase())) { showToast('Email exists','error'); return; }
      const newStaff: StaffMember = { id: `staff-${Date.now()}`, name: formName.trim(), email: formEmail.trim().toLowerCase(), password_hash: formPassword, role: formRole, phone: formPhone.trim(), branch_id: formRole==='master_admin'?undefined:formBranchId, section_id: formRole==='master_admin'?undefined:formSectionId, is_active: formIsActive, signature_base64: formSignatureBase64, created_at: new Date().toISOString() };
      updated = [newStaff, ...staff];
    }
    onSaveStaff(updated);
    setIsModalOpen(false);
    showToast('Staff saved','success');
  };

  const handleDeleteStaff = (id: string) => {
    if(window.confirm('Delete this staff member?')) { onSaveStaff(staff.filter(s => s.id !== id)); showToast('Deleted','info'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-xl font-heading font-extrabold text-slate-900">Staff & Faculty Operations</h2><p className="text-xs text-gray-500 mt-1">Manage institutional credentials, HOD authorizations, digital signatures.</p></div>
        <button onClick={handleOpenAddModal} className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow cursor-pointer"><UserPlus className="w-4 h-4 text-secondary" /> Add Faculty/HOD</button>
      </div>
      <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-gray-150 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none" /></div>
        <div className="w-full md:w-44"><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-gray-150 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"><option value="">All Roles</option><option value="master_admin">Master Admin</option><option value="hod">HOD</option><option value="teacher">Teacher</option></select></div>
        <div className="w-full md:w-48"><select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-gray-150 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"><option value="">All Branches</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b text-[10px] font-bold text-gray-500 uppercase"><tr><th className="px-6 py-4">Faculty Member</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Branch/Section</th><th className="px-6 py-4">Signature</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y text-xs">
                {filteredStaff.map(member => {
                  const br = branches.find(b => b.id === member.branch_id);
                  const sec = sections.find(s => s.id === member.section_id);
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="space-y-1"><span className="block font-bold text-slate-900 text-sm">{member.name}</span><span className="flex items-center gap-1.5 text-gray-500 text-[11px] font-mono"><Mail className="w-3.5 h-3.5" /> {member.email}</span>{member.phone && <span className="flex items-center gap-1.5 text-gray-400 text-[10px]"><Phone className="w-3.5 h-3.5" /> {member.phone}</span>}</div>
                      </td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${member.role==='master_admin'?'bg-indigo-50 text-indigo-700':member.role==='hod'?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700'}`}><Shield className="w-3 h-3" /> {member.role==='master_admin'?'Master Admin':member.role==='hod'?'HOD':'Teacher'}</span></td>
                      <td className="px-6 py-4">{member.role==='master_admin' ? <span className="text-gray-400 italic">Full Central Access</span> : <div className="space-y-1"><span className="flex items-center gap-1 text-[11px] font-semibold text-gray-700"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {br?br.name:'Unknown'}</span><span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono"><Layers className="w-3.5 h-3.5" /> {sec?sec.name:'Unallocated'}</span></div>}</td>
                      <td className="px-6 py-4">{member.signature_base64 ? <div className="h-10 w-24 bg-slate-50 rounded border p-1"><img src={member.signature_base64} alt="Sign" className="max-h-full object-contain" /></div> : <span className="text-gray-400 italic text-[11px]">No sign uploaded</span>}</td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${member.is_active?'bg-emerald-100 text-emerald-800':'bg-slate-100 text-gray-500'}`}>{member.is_active?'Active':'Suspended'}</span></td>
                      <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2.5"><button onClick={() => handleOpenEditModal(member)} className="p-1.5 hover:bg-slate-100 text-gray-600 hover:text-primary rounded-lg"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDeleteStaff(member.id)} className="p-1.5 hover:bg-rose-50 text-gray-600 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="p-12 text-center text-gray-400 font-medium">No faculty members found.</div>}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-xl w-full relative border animate-scale-up text-left flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
              <div><h3 className="text-base font-heading font-extrabold text-slate-900">{editingStaff ? `Edit Faculty Profile: ${formName}` : 'Register New Faculty/HOD'}</h3><p className="text-[11px] text-gray-500 mt-0.5">Define login credentials, digital seals, and section allocations.</p></div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveStaffSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name *</label><input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none" /></div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address *</label><input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Telephone / WhatsApp</label><input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none" /></div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{editingStaff ? 'New Password (leave blank to keep)' : 'Portal Access Password *'}</label><input type="password" required={!editingStaff} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Authorized Role *</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value as any)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer">
                    <option value="teacher">Teacher / Coach</option>
                    <option value="hod">HOD (Head of Dept)</option>
                    <option value="master_admin">Master Central Admin</option>
                  </select>
                </div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Branch Allocation</label><select disabled={formRole==='master_admin'} value={formBranchId} onChange={(e) => { setFormBranchId(e.target.value); const filteredSecs = sections.filter(s => s.branch_id === e.target.value); setFormSectionId(filteredSecs[0]?.id || ''); }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none disabled:bg-slate-100 disabled:text-gray-400 cursor-pointer">{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Batch Section Allocation</label><select disabled={formRole==='master_admin'} value={formSectionId} onChange={(e) => setFormSectionId(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none disabled:bg-slate-100 disabled:text-gray-400 cursor-pointer">{sections.filter(s => s.branch_id === formBranchId).map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}</select></div>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl space-y-2">
                <span className="block text-[10px] font-bold text-gray-500 uppercase">Faculty Personal Signature</span>
                <div className="flex items-center gap-4">
                  {formSignatureBase64 ? <div className="relative h-16 w-36 bg-white border rounded p-1"><img src={formSignatureBase64} alt="Pre-loaded sign" className="max-h-full object-contain" /><button type="button" onClick={() => setFormSignatureBase64('')} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow">&times;</button></div> : <div className="h-16 w-36 bg-slate-100 rounded border border-dashed flex items-center justify-center text-[10px] text-gray-400">No Signature</div>}
                  <div className="flex-1"><input type="file" accept="image/*" onChange={handleSignatureUpload} className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-white cursor-pointer" /></div>
                </div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="w-4.5 h-4.5 text-primary accent-primary rounded" /><label className="text-xs font-bold text-gray-700">Is Active (Uncheck to suspend)</label></div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs transition-colors shadow cursor-pointer">Save Profile Change</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-gray-600 font-semibold rounded-xl text-xs transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};