"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  GraduationCap,
  LogOut,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  CreditCard,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Printer,
  ChevronRight,
  BarChart3,
  Layers,
} from "lucide-react";
import type { Student, SiteSettings } from "@/types";
import {
  downloadStudentIdPdf,
  downloadFeeSlipPdf,
  downloadCertificatePdf,
  downloadResultsPdf,
} from "@/lib/pdf";
import { generateCertificateBlob } from "@/lib/pdf/Certificate"; // for preview
import { generateQrCode } from "@/lib/qr";
import LoadingScreen from "@/components/LoadingScreen";

export default function StudentDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<
    "idcard" | "feeslip" | "attendance" | "results" | "certificate"
  >("idcard");
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [certificateBlobUrl, setCertificateBlobUrl] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("skyline_student_logged_in_id");
    if (!id) {
      router.replace("/student/login");
      return;
    }
    (async () => {
      const { data: stud } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();
      if (!stud) {
        router.replace("/student/login");
        return;
      }
      const [{ data: att }, { data: res }, { data: led }] = await Promise.all([
        supabase.from("student_attendance").select("*").eq("student_id", id),
        supabase.from("student_results").select("*").eq("student_id", id),
        supabase.from("fee_ledger_entries").select("*").eq("student_id", id),
      ]);
      setStudent({
        ...stud,
        attendance_records:
          att?.map((a) => ({ date: a.attendance_date, status: a.status })) ||
          [],
        results_records:
          res?.map((r) => ({
            exam_name: r.exam_name,
            subject: r.subject,
            marks_obtained: r.marks_obtained,
            max_marks: r.max_marks,
            remarks: r.remarks,
            created_at: r.created_at,
          })) || [],
        fee_ledgers:
          led?.map((l) => ({
            id: l.id,
            date: l.payment_date,
            amount: l.amount,
            collected_by: l.collected_by,
            payment_mode: l.payment_mode,
            remarks: l.remarks,
          })) || [],
      });
      const { data: setData } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (setData) setSettings(setData);
    })();
  }, []);

  useEffect(() => {
    if (
      student &&
      activeTab === "certificate" &&
      student.results_records?.length
    ) {
      (async () => {
        const verificationUrl = `${window.location.origin}/verify?roll=${encodeURIComponent(student.roll_number)}`;
        const qr = await generateQrCode(verificationUrl);
        setQrCodeBase64(qr);
        // Generate blob for preview (once)
        if (!certificateBlobUrl) {
          const blob = generateCertificateBlob(student, settings, qr);
          const url = URL.createObjectURL(blob);
          setCertificateBlobUrl(url);
        }
      })();
    }
    return () => {
      if (certificateBlobUrl) URL.revokeObjectURL(certificateBlobUrl);
    };
  }, [activeTab, student, settings, qrCodeBase64]);

  const handleLogout = () => {
    localStorage.removeItem("skyline_student_logged_in_id");
    router.push("/student/login");
  };

  if (!student) return <LoadingScreen />;

  const balance = student.fee_amount - student.fee_paid;
  const isPaidFull = balance <= 0;
  const hasResults =
    student.results_records && student.results_records.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
      {/* Attractive header */}
      <header className="bg-primary text-white py-8 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {student.photo_base64 ? (
                <img
                  src={student.photo_base64}
                  alt={student.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-secondary shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center border-4 border-secondary shadow-lg">
                  <User className="w-10 h-10 text-slate-300" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-secondary w-6 h-6 rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-secondary/90 uppercase tracking-widest block">
                Student Dashboard
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {student.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 text-xs bg-white/10 px-2 py-0.5 rounded-full font-mono">
                  <BookOpen className="w-3 h-3" /> {student.roll_number}
                </span>
                <span className="text-xs opacity-75">
                  {student.course_name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl w-full mx-auto px-4 md:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Personal Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Student Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Course</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {student.course_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[180px]">
                    {student.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-slate-700">
                    {student.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">ID Valid Until</p>
                  <p className="text-sm font-bold text-rose-600">
                    {student.valid_till}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Balance Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Fee Account
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tuition Fee</span>
                <span className="font-semibold">
                  ₹{student.fee_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-semibold text-emerald-600">
                  ₹{student.fee_paid.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base">
                <span className="font-bold text-slate-900">Remaining</span>
                <span
                  className={`font-extrabold ${isPaidFull ? "text-emerald-600" : "text-rose-500"}`}
                >
                  ₹{balance.toLocaleString()}
                </span>
              </div>
              <div>
                {isPaidFull ? (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> All
                    dues cleared
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Please
                    clear dues before final exam
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 grid grid-cols-3 sm:grid-cols-5 gap-1">
            {[
              { tab: "idcard", icon: CreditCard, label: "ID Card" },
              { tab: "feeslip", icon: FileSpreadsheet, label: "Fee Slip" },
              { tab: "attendance", icon: Calendar, label: "Attendance" },
              ...(hasResults
                ? [
                    { tab: "results", icon: BarChart3, label: "Results" },
                    { tab: "certificate", icon: Layers, label: "Certificate" },
                  ]
                : []),
            ].map(({ tab, icon: Icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
            {activeTab === "idcard" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Your ID Card
                  </h2>
                  <button
                    onClick={() => downloadStudentIdPdf(student, settings)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
                {/* You can show a preview of the ID card as an image if desired, or just a description */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    Press download to get your official student ID card.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "feeslip" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Fee Ledger
                  </h2>
                  <button
                    onClick={() => downloadFeeSlipPdf(student, settings)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download Slip
                  </button>
                </div>
                {/* Fee ledger entries */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Mode</th>
                        <th className="px-4 py-3">Collected By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {student.fee_ledgers?.map((entry, i) => (
                        <tr key={i} className="text-slate-700">
                          <td className="px-4 py-3 font-medium">
                            {entry.date}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">
                            ₹{entry.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 capitalize">
                            {entry.payment_mode}
                          </td>
                          <td className="px-4 py-3">
                            {entry.collected_by || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!student.fee_ledgers || student.fee_ledgers.length === 0) && (
                  <p className="text-gray-400 text-center py-6">
                    No payment records found.
                  </p>
                )}
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Attendance Records
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {student.attendance_records?.map((rec, i) => (
                        <tr key={i} className="text-slate-700">
                          <td className="px-4 py-3 font-medium">{rec.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                rec.status.toLowerCase() === "present"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {rec.status.toLowerCase() === "present" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!student.attendance_records ||
                  student.attendance_records.length === 0) && (
                  <p className="text-gray-400 text-center py-6">
                    No attendance data yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "results" && hasResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Exam Grades
                  </h2>
                  <button
                    onClick={() => downloadResultsPdf(student, settings)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(
                    (student.results_records ?? []).reduce(
                      (acc, r) => {
                        const exam = r.exam_name || "Exam";
                        if (!acc[exam]) acc[exam] = [];
                        acc[exam].push(r);
                        return acc;
                      },
                      {} as Record<string, typeof student.results_records>,
                    ),
                  ).map(([exam, records]) => (
                    <div
                      key={exam}
                      className="border rounded-xl overflow-hidden"
                    >
                      <div className="bg-slate-100 px-4 py-2 font-semibold text-slate-800 text-sm">
                        {exam}
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 text-left">Subject</th>
                            <th className="px-4 py-2 text-center">Obtained</th>
                            <th className="px-4 py-2 text-center">Max</th>
                            <th className="px-4 py-2 text-center">%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {records.map((rec, i) => (
                            <tr key={i} className="text-slate-700">
                              <td className="px-4 py-2">{rec.subject}</td>
                              <td className="px-4 py-2 text-center font-medium">
                                {rec.marks_obtained}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {rec.max_marks}
                              </td>
                              <td className="px-4 py-2 text-center font-semibold">
                                {(
                                  (Number(rec.marks_obtained) /
                                    Number(rec.max_marks)) *
                                  100
                                ).toFixed(0)}
                                %
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "certificate" && hasResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    Degree Certificate
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (certificateBlobUrl) {
                          const link = document.createElement("a");
                          link.href = certificateBlobUrl;
                          link.download = `Certificate_${student.roll_number}.pdf`;
                          link.click();
                        }
                      }}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition shadow-sm"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button
                      onClick={() => {
                        if (certificateBlobUrl) {
                          const iframe = document.createElement("iframe");
                          iframe.src = certificateBlobUrl;
                          iframe.style.display = "none";
                          document.body.appendChild(iframe);
                          iframe.onload = () => {
                            iframe.contentWindow?.print();
                            setTimeout(
                              () => document.body.removeChild(iframe),
                              1000,
                            );
                          };
                        }
                      }}
                      className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition shadow-sm"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
                <div className="border rounded-xl overflow-hidden bg-white shadow-inner">
                  {certificateBlobUrl ? (
                    <iframe
                      src={certificateBlobUrl}
                      className="w-full h-[600px]"
                      title="Certificate Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      Generating preview...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
