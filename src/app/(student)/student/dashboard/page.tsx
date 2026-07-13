"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  GraduationCap, LogOut, User, Mail, Phone, BookOpen, Calendar, 
  FileSpreadsheet, CreditCard, Download, CheckCircle, AlertCircle, Clock
} from "lucide-react";
import type { Student, SiteSettings } from "@/types";
import { downloadStudentIdPdf, downloadFeeSlipPdf, downloadCertificatePdf, downloadResultsPdf } from "@/lib/pdf";
import { DegreeCertificate } from "@/components/DegreeCertificate";
import Base64Image from "@/components/Base64Image";
import { generateQrCode } from "@/lib/qr";
import LoadingScreen from "@/components/LoadingScreen";

export default function StudentDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<"idcard" | "feeslip" | "attendance" | "results" | "certificate">("idcard");
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("skyline_student_logged_in_id");
    if (!id) { router.replace("/student/login"); return; }
    (async () => {
      const { data: stud } = await supabase.from("students").select("*").eq("id", id).single();
      if (!stud) { router.replace("/student/login"); return; }
      const [{ data: att }, { data: res }, { data: led }] = await Promise.all([
        supabase.from("student_attendance").select("*").eq("student_id", id),
        supabase.from("student_results").select("*").eq("student_id", id),
        supabase.from("fee_ledger_entries").select("*").eq("student_id", id)
      ]);
      setStudent({
        ...stud,
        attendance_records: att?.map(a => ({ date: a.attendance_date, status: a.status })) || [],
        results_records: res?.map(r => ({ exam_name: r.exam_name, subject: r.subject, marks_obtained: r.marks_obtained, max_marks: r.max_marks, remarks: r.remarks })) || [],
        fee_ledgers: led?.map(l => ({ id: l.id, date: l.payment_date, amount: l.amount, collected_by: l.collected_by, payment_mode: l.payment_mode, remarks: l.remarks })) || []
      });
      const { data: setData } = await supabase.from("site_settings").select("*").single();
      if (setData) setSettings(setData);
    })();
  }, []);

  useEffect(() => {
    if (student && activeTab === "certificate" && student.results_records?.length) {
      (async () => {
        const verificationUrl = `${window.location.origin}/verify?roll=${encodeURIComponent(student.roll_number)}`;
        const qr = await generateQrCode(verificationUrl);
        setQrCodeBase64(qr);
      })();
    }
  }, [activeTab, student]);

  const handleLogout = () => {
    localStorage.removeItem("skyline_student_logged_in_id");
    router.push("/student/login");
  };

  if (!student) return <LoadingScreen />;

  const balance = student.fee_amount - student.fee_paid;
  const isPaidFull = balance <= 0;
  const hasResults = student.results_records && student.results_records.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0F172A] text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            {student.photo_base64 ? (
              <img src={student.photo_base64} alt={student.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700"><User className="w-8 h-8 text-slate-400" /></div>
            )}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary font-mono tracking-widest block uppercase">Student Profile Portal</span>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{student.name}</h1>
              <span className="inline-block px-2 py-0.5 bg-slate-800 text-[10px] font-mono font-bold text-gray-300 rounded border border-slate-700">Roll No: {student.roll_number}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all self-start md:self-auto">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 md:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-gray-100 pb-3">Enrolment Details</h3>
            <div className="space-y-4">
              <div><span className="text-[10px] text-gray-400 font-bold uppercase">Registered Course</span><span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary" /> {student.course_name}</span></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase">Email</span><span className="text-xs font-medium text-slate-700 flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {student.email}</span></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase">Phone</span><span className="text-xs font-medium text-slate-700 flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {student.phone}</span></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase">ID Valid Until</span><span className="text-xs font-bold text-rose-600 flex items-center gap-1.5"><Clock className="w-4 h-4" /> {student.valid_till}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-gray-100 pb-3">Fee Account Balance</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Tuition Fee:</span><span className="font-bold text-slate-800">₹{student.fee_amount.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Amount Paid:</span><span className="font-bold text-emerald-600">₹{student.fee_paid.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3"><span className="font-semibold text-slate-900">Remaining Balance:</span><span className={`font-extrabold ${isPaidFull ? 'text-emerald-600' : 'text-rose-500'}`}>₹{balance.toLocaleString()}</span></div>
              <div className="pt-2">
                {isPaidFull ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-[10px] font-semibold"><CheckCircle className="w-4 h-4 text-emerald-500" />Tuition cleared in full.</div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-150 text-[10px] font-semibold"><AlertCircle className="w-4 h-4 text-amber-500" />Please pay remaining dues before final exams.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side – Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 p-2 flex flex-wrap gap-1 shadow-xs">
            {["idcard","feeslip","attendance", ...(hasResults ? ["results","certificate"] : [])].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab===tab ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                {tab==='idcard' && <CreditCard className="w-3.5 h-3.5" />}
                {tab==='feeslip' && <FileSpreadsheet className="w-3.5 h-3.5" />}
                {tab==='attendance' && <Calendar className="w-3.5 h-3.5" />}
                {tab==='results' && <GraduationCap className="w-3.5 h-3.5" />}
                {tab==='certificate' && <CheckCircle className="w-3.5 h-3.5" />}
                {tab==='idcard' && 'ID Card'}
                {tab==='feeslip' && 'Fee Ledger'}
                {tab==='attendance' && 'Attendance'}
                {tab==='results' && 'Exam Grades'}
                {tab==='certificate' && 'Certificate'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-xs min-h-[400px]">

            {/* ----- ID CARD (white, DB images) ----- */}
            {activeTab === 'idcard' && (
              <div className="w-full max-w-2xl space-y-6">
                <h4 className="text-sm font-extrabold text-slate-900">Your Student ID Card</h4>
                <div className="relative w-full aspect-[120/75] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg select-none">
                  {/* Logo */}
                  <div className="absolute top-[7%] left-[6%] w-[12%] aspect-square">
                    {settings?.site_logo_base64 ? (
                      <Base64Image base64={settings.site_logo_base64} alt="Logo" className="w-full h-full object-contain" width={48} height={48} />
                    ) : (
                      <GraduationCap className="w-full h-full text-primary" />
                    )}
                  </div>
                  {/* Institute name */}
                  <div className="absolute top-[7%] left-[20%]">
                    <h5 className="text-[clamp(8px,2vw,16px)] font-extrabold font-heading text-slate-900 leading-tight">
                      {settings?.institute_name?.split(' ').slice(0,2).join(' ').toUpperCase() || 'SKYLINE INSTITUTE'}
                    </h5>
                    <p className="text-[clamp(5px,1.1vw,9px)] font-bold text-amber-500 leading-tight">MANAGEMENT, HOSPITALITY & BARTENDING</p>
                  </div>
                  <div className="absolute top-[26%] left-[6%] right-[6%] h-px bg-gray-200" />
                  <div className="absolute top-[30%] left-[6%] bg-emerald-500 text-white text-[clamp(6px,1.4vw,11px)] font-extrabold px-2 py-0.5 rounded">STUDENT ID</div>
                  <div className="absolute top-[40%] left-[6%] text-[clamp(10px,2.5vw,20px)] font-extrabold text-slate-900 uppercase tracking-tight">{student.name}</div>
                  <div className="absolute top-[52%] left-[6%] text-[clamp(6px,1.4vw,11px)] text-slate-600 space-y-1">
                    <div><span className="text-slate-400">Roll No: </span><span className="font-bold text-slate-900">{student.roll_number}</span></div>
                    <div><span className="text-slate-400">Course: </span><span className="font-bold text-amber-600">{student.course_name}</span></div>
                    <div><span className="text-slate-400">Phone: </span><span className="font-bold text-slate-900">{student.phone}</span></div>
                    <div><span className="text-slate-400">Valid Till: </span><span className="font-bold text-rose-600">{student.valid_till}</span></div>
                  </div>
                  <div className="absolute top-[27%] right-[6%] w-[18%] aspect-[3/4] border border-gray-300 rounded overflow-hidden bg-gray-100">
                    {student.photo_base64 ? (
                      <img src={student.photo_base64} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div className="absolute bottom-[14%] left-[38%] w-[32%] flex flex-col items-center">
                    {settings?.hod_signature_base64 ? (
                      <Base64Image base64={settings.hod_signature_base64} alt="Signature" className="w-full h-auto object-contain" width={128} height={72} />
                    ) : (
                      <div className="w-full h-4 border-b border-gray-400"></div>
                    )}
                    <span className="text-[clamp(5px,0.9vw,7px)] text-gray-500 mt-0.5">Authorized Signatory</span>
                  </div>
                  <div className="absolute bottom-[8%] left-[6%] w-[14%] aspect-square flex flex-col items-center">
                    {settings?.office_seal_base64 ? (
                      <Base64Image base64={settings.office_seal_base64} alt="Seal" className="w-full h-full object-contain" width={56} height={56} />
                    ) : (
                      <div className="w-full h-full rounded-full border-2 border-gray-400 flex items-center justify-center text-[clamp(5px,0.9vw,7px)] text-gray-400">SEAL</div>
                    )}
                    <span className="text-[clamp(5px,0.9vw,7px)] text-gray-500 mt-0.5">Institute Seal</span>
                  </div>
                </div>
                <button onClick={() => downloadStudentIdPdf(student, settings)} className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/95 transition-all w-full">
                  <Download className="w-4 h-4" /> Download ID Card (PDF)
                </button>
              </div>
            )}

            {/* ----- FEE SLIP (with ledger) ----- */}
            {activeTab === 'feeslip' && (
              <div className="w-full max-w-lg space-y-6 text-left">
                <div className="text-center"><h4 className="text-sm font-extrabold text-slate-900">Official Tuition Fee Receipt</h4></div>
                <div className="bg-slate-50 border border-gray-150 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <div><span className="text-[10px] font-bold text-gray-400 uppercase">Receipt Number</span><span className="font-mono font-bold text-slate-800">REC-{student.id.replace('student-','')}</span></div>
                    <div className="text-right"><span className="text-[10px] font-bold text-gray-400 uppercase">Payment Date</span><span className="font-bold text-slate-800">{student.reg_date}</span></div>
                  </div>
                  <div className="space-y-2 pt-1.5 text-slate-600">
                    <div className="flex justify-between pb-1 border-b border-dashed"><span>Course Fee & Material:</span><span className="font-bold text-slate-800">₹{student.fee_amount.toLocaleString()}</span></div>
                    {student.fee_ledgers && student.fee_ledgers.length > 0 ? (
                      student.fee_ledgers.map(entry => (
                        <div key={entry.id} className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 p-2 rounded border font-mono text-[10px]">
                          <div><span className="font-bold block">₹{entry.amount.toLocaleString()} ({entry.payment_mode.toUpperCase()})</span><span className="text-[8px] text-gray-400">Date: {entry.date} • Registrar: {entry.collected_by}</span>{entry.remarks && <span className="block text-[8px] italic text-gray-500">"{entry.remarks}"</span>}</div>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">Cleared</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-emerald-600 font-semibold pt-1.5"><span>Tuition Fee Installment Paid:</span><span>- ₹{student.fee_paid.toLocaleString()}</span></div>
                    )}
                    <div className="flex justify-between pt-2.5 border-t border-gray-200 font-extrabold text-slate-900 text-sm"><span>Remaining Balance Due:</span><span className={student.fee_balance>0?'text-rose-500':'text-emerald-600'}>₹{student.fee_balance.toLocaleString()}</span></div>
                  </div>
                </div>
                <button onClick={() => downloadFeeSlipPdf(student, settings)} className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-emerald-650 transition-all w-full">
                  <Download className="w-4 h-4" /> Download Fee Receipt (PDF)
                </button>
              </div>
            )}

            {/* ----- ATTENDANCE ----- */}
            {activeTab === 'attendance' && (
              <div className="w-full space-y-6 text-left">
                <div className="text-center"><h4 className="text-sm font-extrabold text-slate-900">Academic Attendance Metrics</h4></div>
                {(() => {
                  const total = student.attendance_records?.length || 0;
                  const presents = student.attendance_records?.filter(a=>a.status==='Present').length || 0;
                  const lates = student.attendance_records?.filter(a=>a.status==='Late').length || 0;
                  const absents = student.attendance_records?.filter(a=>a.status==='Absent').length || 0;
                  const ratio = total>0 ? Math.round(((presents+lates*0.5)/total)*100) : 100;
                  return (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border p-3 rounded-2xl text-center"><span className="block text-[8px] font-bold text-gray-400 uppercase">Present Ratio</span><span className={`block text-xl font-black mt-1 ${ratio>=75?'text-emerald-600':'text-rose-500'}`}>{ratio}%</span></div>
                        <div className="bg-slate-50 border p-3 rounded-2xl text-center"><span className="block text-[8px] font-bold text-gray-400 uppercase">Total Days</span><span className="block text-xl font-black text-slate-800 mt-1">{total}</span></div>
                        <div className="bg-slate-50 border p-3 rounded-2xl text-center"><span className="block text-[8px] font-bold text-gray-400 uppercase">Presents</span><span className="block text-xl font-black text-emerald-600 mt-1">{presents}</span></div>
                        <div className="bg-slate-50 border p-3 rounded-2xl text-center"><span className="block text-[8px] font-bold text-gray-400 uppercase">Absents</span><span className="block text-xl font-black text-rose-500 mt-1">{absents}</span></div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-h-52 overflow-y-auto divide-y divide-gray-50">
                        {student.attendance_records?.slice().reverse().map((rec, i) => (
                          <div key={i} className="px-4 py-3 flex justify-between items-center text-xs"><span className="font-semibold text-slate-700">{rec.date}</span><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${rec.status==='Present'?'bg-emerald-100 text-emerald-800':rec.status==='Late'?'bg-amber-100 text-amber-800':'bg-rose-100 text-rose-800'}`}>{rec.status}</span></div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ----- RESULTS (table) ----- */}
            {activeTab === 'results' && hasResults && (
              <div className="w-full space-y-6 text-left">
                <div className="text-center"><h4 className="text-sm font-extrabold text-slate-900">Exam Grade Sheet</h4></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100/80 border-b text-[10px] font-extrabold text-slate-500 uppercase"><tr><th className="px-5 py-3">Exam</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3 text-center">Obt.</th><th className="px-5 py-3 text-center">Max</th><th className="px-5 py-3 text-center">%</th><th className="px-5 py-3 text-right">Remarks</th></tr></thead>
                    <tbody className="divide-y">
                      {student.results_records?.map((r,i)=> {
                        const pct = Math.round((r.marks_obtained/r.max_marks)*100);
                        return (<tr key={i} className="hover:bg-slate-50"><td className="px-5 py-4 font-bold">{r.exam_name}</td><td className="px-5 py-4">{r.subject}</td><td className="px-5 py-4 text-center font-bold">{r.marks_obtained}</td><td className="px-5 py-4 text-center">{r.max_marks}</td><td className="px-5 py-4 text-center">{pct}%</td><td className="px-5 py-4 text-right italic">{r.remarks||'-'}</td></tr>);
                      })}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => downloadResultsPdf(student, settings)} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md w-full">
                  <Download className="w-4 h-4" /> Download Grade Sheet (PDF)
                </button>
              </div>
            )}

            {/* ----- CERTIFICATE (with QR) ----- */}
            {activeTab === 'certificate' && hasResults && (
              <div className="w-full space-y-6">
                <h4 className="text-sm font-extrabold text-slate-900">Official Diploma Certificate</h4>
                <DegreeCertificate student={student} settings={settings} qrCodeBase64={qrCodeBase64} />
                <button onClick={() => downloadCertificatePdf(student, settings, qrCodeBase64)} className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/95 transition-all w-full">
                  <Download className="w-4 h-4" /> Download Certificate (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};