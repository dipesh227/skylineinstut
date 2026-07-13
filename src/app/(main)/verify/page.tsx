"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Award, Search, ArrowRight, CheckCircle, AlertTriangle, Download } from "lucide-react";
import type { Student, SiteSettings } from "@/types";
import { DegreeCertificate } from "@/components/DegreeCertificate";
import { downloadCertificatePdf } from "@/lib/pdf";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const initialRoll = searchParams.get("roll") || "";
  const supabase = createClient();
  const [rollNumber, setRollNumber] = useState(initialRoll);
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").single();
      if (data) setSettings(data);
    })();
    if (initialRoll) handleVerify(initialRoll);
  }, []);

  const handleVerify = async (roll: string = rollNumber) => {
    if (!roll.trim()) return;
    setLoading(true);
    setSearched(true);

    // Fetch student
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("roll_number", roll.trim())
      .single();

    if (data) {
      // Fetch results for this student
      const { data: results } = await supabase
        .from("student_results")
        .select("*")
        .eq("student_id", data.id);

      const fullStudent: Student = {
        ...data,
        results_records: results?.map(r => ({
          exam_name: r.exam_name,
          subject: r.subject,
          marks_obtained: r.marks_obtained,
          max_marks: r.max_marks,
          remarks: r.remarks,
        })) || [],
        attendance_records: [],
        fee_ledgers: [],
      };

      setStudent(fullStudent);
      setHasResults(results && results.length > 0);

      if (results && results.length > 0) {
        // Generate QR code only if results exist
        const verificationUrl = `${window.location.origin}/verify?roll=${encodeURIComponent(data.roll_number)}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verificationUrl)}`;
        const res = await fetch(qrUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => setQrCodeBase64(reader.result as string);
        reader.readAsDataURL(blob);
      }
    } else {
      setStudent(null);
      setHasResults(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cream/20 py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <Award className="w-10 h-10 text-amber-600 mx-auto" />
          <h1 className="text-4xl font-extrabold font-heading text-slate-900">Credential Verification Portal</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">Verify Skyline Institute professional diplomas and certifications.</p>
        </div>

        <div className="bg-white rounded-3xl border p-6 md:p-8 shadow-xl max-w-2xl mx-auto space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold font-mono uppercase text-slate-500">Enter Roll Number</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. STL-2026-001"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button onClick={() => handleVerify()} disabled={loading} className="px-6 py-3 bg-primary hover:bg-primary/95 text-white text-sm font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Verify</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>

        {searched && !loading && (
          <div className="space-y-8">
            {student ? (
              <>
                {hasResults ? (
                  <>
                    <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                      <div className="text-left text-xs text-emerald-800">
                        We confirm that <strong>{student.name}</strong> has completed the program and holds a verified certificate.
                      </div>
                    </div>
                    <DegreeCertificate student={student} settings={settings} qrCodeBase64={qrCodeBase64} />
                    <div className="flex justify-center">
                      <button onClick={() => downloadCertificatePdf(student, settings, qrCodeBase64)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md">
                        <Download className="w-4 h-4" /> Download Verified PDF
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-150 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                    <div className="text-left text-xs text-amber-800">
                      <strong>{student.name}</strong> is enrolled in <strong>{student.course_name}</strong> but has not yet been awarded a certificate. No results are on record.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-rose-50 border border-rose-150 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
                <h3 className="text-lg font-bold text-rose-950">Verification Unsuccessful</h3>
                <p className="text-xs text-rose-700">The roll number "{rollNumber}" was not found in our database.</p>
                <button onClick={() => { setSearched(false); setRollNumber(""); }} className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl">Try Another Search</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}