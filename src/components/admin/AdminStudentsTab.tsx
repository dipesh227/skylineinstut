"use client";
import React, { useState } from 'react';
import { Plus, Search, User, Phone, Mail, BookOpen, Calendar, Edit2, Trash2, Upload, CreditCard, FileSpreadsheet, IdCard, AlertCircle, Download } from 'lucide-react';
import { Student, Course } from '@/types';
import { useToast } from '@/components/Toast';
import { downloadStudentIdPdf, downloadFeeSlipPdf, downloadCertificatePdf, downloadResultsPdf } from '@/lib/pdf';
import { createClient } from '@/utils/supabase/client';
import { generateQrCode } from '@/lib/qr';
import { useAdminContext } from '@/components/admin/AdminDataContext';

interface AdminStudentsTabProps {
  courses: Course[];
  students: Student[];
  onSaveStudents: (updated: Student[]) => void;
}

export const AdminStudentsTab: React.FC<AdminStudentsTabProps> = ({ courses, students, onSaveStudents }) => {
  const { showToast } = useToast();
  const supabase = createClient();
  const { settings } = useAdminContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formName, setFormName] = useState(''); const [formRollNumber, setFormRollNumber] = useState('');
  const [formEmail, setFormEmail] = useState(''); const [formPhone, setFormPhone] = useState('');
  const [formCourseId, setFormCourseId] = useState(''); const [formFeeAmount, setFormFeeAmount] = useState<number>(0);
  const [formFeePaid, setFormFeePaid] = useState<number>(0);
  const [formRegDate, setFormRegDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formValidTill, setFormValidTill] = useState(() => { const d = new Date(); d.setMonth(d.getMonth()+3); return d.toISOString().split('T')[0]; });
  const [formPhotoBase64, setFormPhotoBase64] = useState(''); const [formBranchId, setFormBranchId] = useState(''); const [formSectionId, setFormSectionId] = useState('');

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present'|'Absent'|'Late'>>({});
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [resultsStudent, setResultsStudent] = useState<Student | null>(null);
  const [examName, setExamName] = useState(''); const [subject, setSubject] = useState('');
  const [marksObtained, setMarksObtained] = useState<number>(0); const [maxMarks, setMaxMarks] = useState<number>(100);
  const [remarks, setRemarks] = useState('');

  const fetchFullStudent = async (id: string): Promise<Student> => {
    const { data: stud } = await supabase.from("students").select("*").eq("id", id).single();
    const [{ data: att }, { data: res }, { data: led }] = await Promise.all([
      supabase.from("student_attendance").select("*").eq("student_id", id),
      supabase.from("student_results").select("*").eq("student_id", id),
      supabase.from("fee_ledger_entries").select("*").eq("student_id", id)
    ]);
    return {
      ...stud,
      attendance_records: att?.map(a => ({ date: a.attendance_date, status: a.status })) || [],
      results_records: res?.map(r => ({ exam_name: r.exam_name, subject: r.subject, marks_obtained: r.marks_obtained, max_marks: r.max_marks, remarks: r.remarks })) || [],
      fee_ledgers: led?.map(l => ({ id: l.id, date: l.payment_date, amount: l.amount, collected_by: l.collected_by, payment_mode: l.payment_mode, remarks: l.remarks })) || []
    };
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchCourse = !selectedCourseFilter || s.course_id === selectedCourseFilter;
    return matchSearch && matchCourse;
  });

  const handleCourseSelect = (courseId: string) => {
    setFormCourseId(courseId);
    const selectedCourse = courses.find(c => c.id === courseId);
    if (selectedCourse) setFormFeeAmount(selectedCourse.fee_numeric || 0);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    if(file.size > 1024 * 1024) { showToast('Image too large','error'); return; }
    const reader = new FileReader();
    reader.onload = () => { setFormPhotoBase64(reader.result as string); showToast('Photo uploaded','success'); };
    reader.onerror = () => showToast('Error','error');
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null); setFormName(''); setFormRollNumber(`SLM-${new Date().getFullYear()}-${String(students.length+1).padStart(3,'0')}`);
    setFormEmail(''); setFormPhone(''); setFormCourseId(courses[0]?.id || ''); setFormFeeAmount(courses[0]?.fee_numeric || 0);
    setFormFeePaid(0); setFormRegDate(new Date().toISOString().split('T')[0]);
    const d = new Date(); d.setMonth(d.getMonth()+3); setFormValidTill(d.toISOString().split('T')[0]);
    setFormPhotoBase64(''); setFormBranchId(''); setFormSectionId(''); setIsModalOpen(true);
  };

  const handleOpenEditModal = async (student: Student) => {
    const full = await fetchFullStudent(student.id);
    setEditingStudent(full);
    setFormName(full.name); setFormRollNumber(full.roll_number); setFormEmail(full.email); setFormPhone(full.phone);
    setFormCourseId(full.course_id); setFormFeeAmount(full.fee_amount); setFormFeePaid(full.fee_paid);
    setFormRegDate(full.reg_date); setFormValidTill(full.valid_till); setFormPhotoBase64(full.photo_base64 || '');
    setFormBranchId(full.branch_id || ''); setFormSectionId(full.section_id || ''); setIsModalOpen(true);
  };

  const handleSaveStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formName.trim() || !formRollNumber.trim() || !formEmail.trim() || !formPhone.trim() || !formCourseId) { showToast('Fill required fields','error'); return; }
    const selectedCourse = courses.find(c => c.id === formCourseId);
    const courseName = selectedCourse ? selectedCourse.title : 'Selected Course';
    const balance = Math.max(0, formFeeAmount - formFeePaid);
    let updatedList: Student[];
    if(editingStudent) {
      updatedList = students.map(s => s.id === editingStudent.id ? { ...s, name: formName, roll_number: formRollNumber, email: formEmail, phone: formPhone, course_id: formCourseId, course_name: courseName, fee_amount: formFeeAmount, fee_paid: formFeePaid, fee_balance: balance, reg_date: formRegDate, valid_till: formValidTill, photo_base64: formPhotoBase64, branch_id: formBranchId || undefined, section_id: formSectionId || undefined } : s);
    } else {
      if(students.some(s => s.roll_number === formRollNumber || s.email === formEmail)) { showToast('Duplicate roll/email','error'); return; }
      const newStudent: Student = { id: `student-${Date.now()}`, name: formName, roll_number: formRollNumber, email: formEmail, phone: formPhone, course_id: formCourseId, course_name: courseName, fee_amount: formFeeAmount, fee_paid: formFeePaid, fee_balance: balance, reg_date: formRegDate, valid_till: formValidTill, photo_base64: formPhotoBase64, branch_id: formBranchId || undefined, section_id: formSectionId || undefined, attendance_records: [], results_records: [], created_at: new Date().toISOString() };
      updatedList = [newStudent, ...students];
    }
    onSaveStudents(updatedList);
    setIsModalOpen(false);
    showToast('Student saved','success');
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if(window.confirm(`Delete ${name}?`)) {
      await supabase.from("students").delete().eq("id", id);
      onSaveStudents(students.filter(s => s.id !== id));
      showToast('Deleted','info');
    }
  };

  const handleSaveAttendance = async () => {
    const updates = filteredStudents.map(async s => {
      if (attendanceMap[s.id] !== undefined) {
        const { error } = await supabase.from("student_attendance").upsert({
          id: `${s.id}_${attendanceDate}`,
          student_id: s.id,
          attendance_date: attendanceDate,
          status: attendanceMap[s.id]
        }, { onConflict: 'student_id,attendance_date' });
        if (error) console.error(error);
      }
    });
    await Promise.all(updates);
    setIsAttendanceModalOpen(false);
    showToast('Attendance saved','success');
  };

  const handleAddResult = async () => {
    if(!resultsStudent || !examName.trim() || !subject.trim() || maxMarks <= 0) { showToast('Fill all fields','error'); return; }
    if(marksObtained > maxMarks) { showToast('Marks > max','error'); return; }
    const newRecord = {
      id: `${resultsStudent.id}_${examName}_${subject}`,
      student_id: resultsStudent.id,
      exam_name: examName.trim(),
      subject: subject.trim(),
      marks_obtained: marksObtained,
      max_marks: maxMarks,
      remarks: remarks.trim()
    };
    const { error } = await supabase.from("student_results").upsert(newRecord);
    if (error) { showToast('Error saving result','error'); return; }

    const updatedResults = [...(resultsStudent.results_records || []), {
      exam_name: examName.trim(), subject: subject.trim(), marks_obtained: marksObtained, max_marks: maxMarks, remarks: remarks.trim()
    }];
    const updatedStudent = { ...resultsStudent, results_records: updatedResults };
    setResultsStudent(updatedStudent);
    const updatedList = students.map(s => s.id === resultsStudent.id ? updatedStudent : s);
    onSaveStudents(updatedList);
    setExamName(''); setSubject(''); setMarksObtained(0); setMaxMarks(100); setRemarks('');
    showToast('Result added','success');
  };

  const openResultsModal = async (student: Student) => {
    const full = await fetchFullStudent(student.id);
    setResultsStudent(full);
    setExamName(''); setSubject(''); setMarksObtained(0); setMaxMarks(100); setRemarks('');
    setIsResultsModalOpen(true);
  };

  const openAttendanceModal = () => {
    const initialMap: Record<string, 'Present'|'Absent'|'Late'> = {};
    filteredStudents.forEach(s => {
      const rec = s.attendance_records?.find(a => a.date === attendanceDate);
      initialMap[s.id] = (rec?.status as any) || 'Present';
    });
    setAttendanceMap(initialMap);
    setIsAttendanceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-xs">
        <div><h2 className="text-xl font-extrabold text-slate-900"><IdCard className="w-6 h-6 inline text-primary" /> Active Student Enrolments</h2><p className="text-xs text-gray-500 mt-1">Enrol new candidates, record payments, download credentials.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openAttendanceModal} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"><Calendar className="w-4 h-4 inline mr-1" /> Record Attendance</button>
          <button onClick={handleOpenAddModal} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"><Plus className="w-4 h-4 inline mr-1" /> Enroll Student</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-1 md:col-span-2"><Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" /><input type="text" placeholder="Search by name, roll, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-xs" /></div>
        <div><select value={selectedCourseFilter} onChange={(e) => setSelectedCourseFilter(e.target.value)} className="w-full px-4 py-3 bg-white border rounded-xl text-xs"><option value="">All Courses</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase"><tr><th className="px-6 py-4">Roll & Profile</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Course</th><th className="px-6 py-4">Branch/Section</th><th className="px-6 py-4">Financials</th><th className="px-6 py-4">Validity</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y">
              {filteredStudents.length === 0 ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No students found.</td></tr> :
                filteredStudents.map(s => {
                  const balance = s.fee_amount - s.fee_paid;
                  const isPaidFull = balance <= 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4"><div className="flex items-center gap-3">{s.photo_base64 ? <img src={s.photo_base64} className="w-10 h-10 rounded-full object-cover border" /> : <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-4.5 h-4.5 text-slate-400" /></div>}<div><span className="block text-xs font-extrabold text-slate-900">{s.name}</span><span className="inline-block px-1.5 py-0.5 mt-0.5 bg-slate-100 text-[9px] font-mono font-bold text-slate-600 rounded">{s.roll_number}</span></div></div></td>
                      <td className="px-6 py-4"><div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{s.phone}</div><div className="flex items-center gap-1.5 text-gray-400"><Mail className="w-3 h-3" />{s.email}</div></td>
                      <td className="px-6 py-4"><span className="font-semibold">{s.course_name}</span></td>
                      <td className="px-6 py-4"><span>{s.branch_id || 'N/A'}</span> / <span>{s.section_id || 'N/A'}</span></td>
                      <td className="px-6 py-4"><div className="text-[11px]"><span>Total: ₹{s.fee_amount}</span><br/><span className="text-emerald-600">Paid: ₹{s.fee_paid}</span><br/><span className={isPaidFull ? 'text-emerald-600' : 'text-rose-500'}>Due: ₹{balance}</span></div></td>
                      <td className="px-6 py-4"><span>{s.reg_date}</span><br/><span className="text-rose-500">Till: {s.valid_till}</span></td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-1">
                        <button onClick={() => downloadStudentIdPdf(s, settings)} className="p-1.5 text-slate-500 hover:text-primary" title="ID Card"><CreditCard className="w-4 h-4" /></button>
                        <button onClick={() => downloadFeeSlipPdf(s, settings)} className="p-1.5 text-slate-500 hover:text-emerald-600" title="Fee Slip"><FileSpreadsheet className="w-4 h-4" /></button>
                        <button onClick={() => openResultsModal(s)} className="p-1.5 text-indigo-500 hover:text-indigo-600" title="Results"><BookOpen className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenEditModal(s)} className="p-1.5 text-slate-500 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteStudent(s.id, s.name)} className="p-1.5 text-slate-500 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </div></td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between"><h3 className="text-lg font-extrabold">{editingStudent ? `Update ${editingStudent.name}` : 'Enroll Student'}</h3><button onClick={() => setIsModalOpen(false)}>&times;</button></div>
            <form onSubmit={handleSaveStudentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label>Full Name *</label><input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
                <div><label>Roll Number *</label><input type="text" required value={formRollNumber} onChange={(e) => setFormRollNumber(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label>Email *</label><input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
                <div><label>Phone *</label><input type="tel" required value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label>Course *</label><select value={formCourseId} onChange={(e) => handleCourseSelect(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs">{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
                <div><label>Total Fee (₹)</label><input type="number" required value={formFeeAmount} onChange={(e) => setFormFeeAmount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
                <div><label>Deposit (₹)</label><input type="number" required value={formFeePaid} onChange={(e) => setFormFeePaid(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label>Reg Date</label><input type="date" required value={formRegDate} onChange={(e) => setFormRegDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
                <div><label>Valid Till</label><input type="date" required value={formValidTill} onChange={(e) => setFormValidTill(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
              </div>
              <div className="flex items-center gap-3">
                {formPhotoBase64 ? <img src={formPhotoBase64} className="w-14 h-14 rounded-full object-cover border" /> : <div className="w-14 h-14 rounded-full bg-slate-200" />}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold">{editingStudent ? 'Update' : 'Enroll'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between"><h3 className="text-lg font-extrabold">Record Attendance</h3><button onClick={() => setIsAttendanceModalOpen(false)}>&times;</button></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border">
                <label className="text-xs font-bold text-gray-700">Date:</label>
                <input type="date" value={attendanceDate} onChange={(e) => { setAttendanceDate(e.target.value); const newMap: Record<string,'Present'|'Absent'|'Late'> = {}; filteredStudents.forEach(s => { const rec = s.attendance_records?.find(a => a.date === e.target.value); newMap[s.id] = (rec?.status as any) || 'Present'; }); setAttendanceMap(newMap); }} className="px-3 py-1.5 bg-white border rounded-lg text-xs font-mono font-bold" />
              </div>
              <div className="border rounded-xl overflow-hidden divide-y max-h-[45vh] overflow-y-auto">
                {filteredStudents.map(s => (
                  <div key={s.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-500 font-mono">{s.name[0]}</div><div><span className="block text-xs font-bold text-slate-900">{s.name}</span><span className="text-[10px] text-gray-400 font-mono">{s.roll_number}</span></div></div>
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border">
                      {(['Present','Absent','Late'] as const).map(status => {
                        const isActive = attendanceMap[s.id] === status;
                        return (
                          <button key={status} onClick={() => setAttendanceMap(prev => ({ ...prev, [s.id]: status }))} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isActive ? (status==='Present'?'bg-emerald-600 text-white':status==='Absent'?'bg-rose-500 text-white':'bg-amber-500 text-white') : 'text-gray-400 hover:text-gray-700'}`}>{status}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setIsAttendanceModalOpen(false)} className="px-5 py-2 bg-slate-100 rounded-xl text-xs font-bold">Close</button>
                <button onClick={handleSaveAttendance} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Save Attendance</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {isResultsModalOpen && resultsStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between"><h3 className="text-lg font-extrabold">Results for {resultsStudent.name}</h3><button onClick={() => setIsResultsModalOpen(false)}>&times;</button></div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase">Performance Score History</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-gray-500 font-bold uppercase text-[9px]"><tr><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3 text-center">Obt.</th><th className="px-4 py-3 text-center">Max</th><th className="px-4 py-3 text-center">%</th><th className="px-4 py-3">Remarks</th><th className="px-4 py-3 text-right">Del</th></tr></thead>
                    <tbody className="divide-y">
                      {(!resultsStudent.results_records || resultsStudent.results_records.length === 0) ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No grade records added.</td></tr>
                      ) : (
                        resultsStudent.results_records.map((rec, index) => {
                          const percentage = Math.round((rec.marks_obtained / rec.max_marks) * 100);
                          return (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-bold text-slate-900">{rec.exam_name}</td>
                              <td className="px-4 py-3 font-semibold text-slate-700">{rec.subject}</td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-indigo-600">{rec.marks_obtained}</td>
                              <td className="px-4 py-3 text-center font-mono text-gray-400">{rec.max_marks}</td>
                              <td className="px-4 py-3 text-center"><span className={`inline-block px-1.5 py-0.5 rounded font-bold font-mono text-[10px] ${percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : percentage >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>{percentage}%</span></td>
                              <td className="px-4 py-3 text-gray-500 italic truncate max-w-[140px]" title={rec.remarks}>{rec.remarks || '-'}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={async () => {
                                  await supabase.from("student_results").delete().eq("id", `${resultsStudent.id}_${rec.exam_name}_${rec.subject}`);
                                  const updatedRecords = resultsStudent.results_records?.filter((_, idx) => idx !== index) || [];
                                  const updatedStudent = { ...resultsStudent, results_records: updatedRecords };
                                  setResultsStudent(updatedStudent);
                                  onSaveStudents(students.map(s => s.id === resultsStudent.id ? updatedStudent : s));
                                  showToast('Record removed','success');
                                }} className="text-rose-500 hover:text-rose-700 p-1">&times;</button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-slate-50/50 p-5 rounded-2xl border space-y-4">
                <h4 className="text-xs font-bold text-indigo-800 uppercase">Add New Marks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase">Exam Name *</label><input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg text-xs" /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase">Subject *</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg text-xs" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase">Marks Obtained *</label><input type="number" value={marksObtained} onChange={(e) => setMarksObtained(Number(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-bold" /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase">Maximum Score *</label><input type="number" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-bold" /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase">Examiner Remarks</label><input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg text-xs" /></div>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={handleAddResult} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Save Result Record</button>
                  <button onClick={() => downloadResultsPdf(resultsStudent, settings)} className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download Grade Sheet</button>
                  <button onClick={async () => { const verificationUrl = `${window.location.origin}/verify?roll=${encodeURIComponent(resultsStudent.roll_number)}`; const qr = await generateQrCode(verificationUrl); downloadCertificatePdf(resultsStudent, settings, qr); }} className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download Certificate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};