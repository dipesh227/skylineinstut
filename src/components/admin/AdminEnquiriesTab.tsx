"use client";
import React, { useState } from 'react';
import { Search, Phone, Mail, MessageSquare, Download, Info, Trash2 } from 'lucide-react';
import { Enquiry, Course } from '@/types';

interface AdminEnquiriesTabProps { enquiries: Enquiry[]; courses: Course[]; onUpdateEnquiry: (updated: Enquiry) => void; onDeleteEnquiry: (id: string) => void; }

export const AdminEnquiriesTab: React.FC<AdminEnquiriesTabProps> = ({ enquiries, courses, onUpdateEnquiry, onDeleteEnquiry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [repliedFilter, setRepliedFilter] = useState('all');
  const [admissionFilter, setAdmissionFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [notesText, setNotesText] = useState('');
  const [feeAmountInput, setFeeAmountInput] = useState('');

  const filtered = enquiries.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.phone.includes(searchTerm);
    const matchCourse = courseFilter==='all' || e.course === courseFilter;
    const matchReplied = repliedFilter==='all' || (repliedFilter==='replied' && e.replied) || (repliedFilter==='pending' && !e.replied);
    const matchAdmission = admissionFilter==='all' || (admissionFilter==='admitted' && e.admission_ok) || (admissionFilter==='pending' && !e.admission_ok);
    const matchFee = feeFilter==='all' || (feeFilter==='paid' && e.fee_paid) || (feeFilter==='pending' && !e.fee_paid);
    return matchSearch && matchCourse && matchReplied && matchAdmission && matchFee;
  });

  const toggleReplied = (e: Enquiry) => onUpdateEnquiry({ ...e, replied: !e.replied });
  const toggleAdmission = (e: Enquiry) => onUpdateEnquiry({ ...e, admission_ok: !e.admission_ok });
  const toggleFeePaid = (e: Enquiry) => {
    const defaultFee = courses.find(c => c.title === e.course)?.fee_numeric || 25000;
    onUpdateEnquiry({ ...e, fee_paid: !e.fee_paid, fee_amount: !e.fee_paid ? defaultFee : undefined });
  };

  const openDetail = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setNotesText(enq.admin_notes || '');
    setFeeAmountInput(enq.fee_amount ? String(enq.fee_amount) : '');
    if (enq.status === 'new') onUpdateEnquiry({ ...enq, status: 'read' });
  };

  const saveDetail = () => {
    if (!selectedEnquiry) return;
    onUpdateEnquiry({ ...selectedEnquiry, admin_notes: notesText, fee_amount: parseFloat(feeAmountInput) || undefined });
    setSelectedEnquiry(null);
  };

  const exportCSV = () => {
    const headers = ['ID','Date','Name','Phone','Email','Course','Status','Replied','Admitted','Fee Paid','Fee Amount','Notes'];
    const rows = filtered.map(e => [e.id, e.created_at, e.name, e.phone, e.email||'', e.course, e.status, e.replied?'Yes':'No', e.admission_ok?'Yes':'No', e.fee_paid?'Yes':'No', e.fee_amount||'0', e.admin_notes||'']);
    const csv = [headers.join(','), ...rows.map(r => r.map(f => `"${f}"`).join(','))].join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `enquiries-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div className="space-y-6 text-left animate-slide-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold font-heading text-slate-900">Enquiry & Admissions Board</h2><p className="text-xs text-gray-500">Review applications, manage communications, record fee receipts.</p></div>
        <button onClick={exportCSV} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"><Download className="w-4 h-4" /> Export CSV</button>
      </div>
      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs" /></div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="px-3 py-2 border rounded-xl text-xs"><option value="all">All Courses</option>{courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}</select>
        <select value={repliedFilter} onChange={e => setRepliedFilter(e.target.value)} className="px-3 py-2 border rounded-xl text-xs"><option value="all">Replies: All</option><option value="replied">Replied</option><option value="pending">Pending</option></select>
        <select value={admissionFilter} onChange={e => setAdmissionFilter(e.target.value)} className="px-3 py-2 border rounded-xl text-xs"><option value="all">Admission: All</option><option value="admitted">Admitted</option><option value="pending">Pending</option></select>
        <select value={feeFilter} onChange={e => setFeeFilter(e.target.value)} className="px-3 py-2 border rounded-xl text-xs"><option value="all">Fee: All</option><option value="paid">Paid</option><option value="pending">Pending</option></select>
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase"><tr><th className="py-3 px-4">Student</th><th className="py-3 px-4">Course</th><th className="py-3 px-4 text-center">Contact</th><th className="py-3 px-4 text-center">Replied?</th><th className="py-3 px-4 text-center">Admission?</th><th className="py-3 px-4 text-center">Fee Paid?</th><th className="py-3 px-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {filtered.length===0 ? <tr><td colSpan={7} className="py-14 text-center text-gray-400">No enquiries found.</td></tr> :
              filtered.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4"><div className="font-bold">{e.name}</div><div className="text-gray-500 font-mono text-[10px]">{e.phone}</div></td>
                  <td className="py-3 px-4"><span className="font-semibold">{e.course}</span></td>
                  <td className="py-3 px-4 text-center"><div className="flex justify-center gap-2"><a href={`tel:${e.phone}`} className="p-1.5 text-gray-400 hover:text-primary"><Phone className="w-4 h-4" /></a><a href={`https://wa.me/${e.phone.replace(/\D/g,'')}`} target="_blank" className="p-1.5 text-gray-400 hover:text-emerald-600"><MessageSquare className="w-4 h-4" /></a></div></td>
                  <td className="py-3 px-4 text-center"><button onClick={() => toggleReplied(e)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${e.replied?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}`}>{e.replied?'Yes':'No'}</button></td>
                  <td className="py-3 px-4 text-center"><button onClick={() => toggleAdmission(e)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${e.admission_ok?'bg-primary/10 text-primary':'bg-gray-100 text-gray-400'}`}>{e.admission_ok?'Yes':'No'}</button></td>
                  <td className="py-3 px-4 text-center"><button onClick={() => toggleFeePaid(e)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${e.fee_paid?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{e.fee_paid?'Yes':'No'}</button></td>
                  <td className="py-3 px-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => openDetail(e)} className="p-1.5 text-gray-400 hover:text-primary"><Info className="w-4 h-4" /></button><button onClick={() => { if(window.confirm('Delete?')) onDeleteEnquiry(e.id); }} className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {/* Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">Enquiry Detail</h3>
            <div className="space-y-2 text-sm"><p><strong>Name:</strong> {selectedEnquiry.name}</p><p><strong>Phone:</strong> {selectedEnquiry.phone}</p><p><strong>Course:</strong> {selectedEnquiry.course}</p><p><strong>Message:</strong> {selectedEnquiry.message}</p></div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold">Admin Notes</label>
              <textarea value={notesText} onChange={e => setNotesText(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-xl text-xs" />
              {selectedEnquiry.fee_paid && (
                <div><label className="text-xs font-bold">Fee Amount (₹)</label><input type="number" value={feeAmountInput} onChange={e => setFeeAmountInput(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedEnquiry(null)} className="px-4 py-2 border rounded-xl text-xs">Close</button>
              <button onClick={saveDetail} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};