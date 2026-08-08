import React from "react";
import { Student, SiteSettings } from "@/types";

interface Props {
  student: Student;
  settings: SiteSettings | null;
  qrCodeBase64: string;
}

export const DegreeCertificate: React.FC<Props> = ({ student, settings, qrCodeBase64 }) => {
  const instituteName = settings?.institute_name || "SKYLINE INSTITUTE";
  const results = student.results_records || [];
  const totalObtained = results.reduce((sum, r) => sum + r.marks_obtained, 0);
  const totalMax = results.reduce((sum, r) => sum + r.max_marks, 0);
  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 85;

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#FFFBEB] border-2 border-[#D97706] rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-[#D97706]" />
      <div className="text-[#78350F] text-xs font-bold uppercase tracking-widest mb-2">Academic Registry & Graduation Services</div>
      <h2 className="text-3xl font-bold text-slate-900 font-heading mb-1">{instituteName.toUpperCase()}</h2>
      <div className="text-[#D97706] font-bold text-sm mb-4">MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY</div>
      <div className="text-slate-700 text-lg italic mb-4">This is to officially certify that</div>
      <div className="text-2xl font-extrabold text-slate-900 mb-2">{student.name.toUpperCase()}</div>
      <div className="text-slate-600 text-sm mb-4">has successfully completed the professional program</div>
      <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg px-4 py-2 font-bold text-slate-900 text-sm inline-block mb-6">
        {student.course_name.toUpperCase()}
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs font-bold text-gray-500 border-t border-b border-gray-200 py-3 mb-4">
        <div>ROLL NUMBER<br/><span className="text-slate-900">{student.roll_number}</span></div>
        <div>GRADUATION DATE<br/><span className="text-slate-900">{student.reg_date}</span></div>
        <div>ENROLLMENT ID<br/><span className="text-slate-900">{student.id.replace("student-","").toUpperCase()}</span></div>
        <div>STATUS<br/><span className="text-emerald-600">{percentage}% Passed</span></div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-left text-xs text-gray-500">
          <div className="font-bold">OFFICIAL SEAL</div>
          {settings?.office_seal_base64 ? <img src={settings.office_seal_base64} alt="Seal" className="w-16 h-16 object-contain mt-1" /> : <div className="w-16 h-16 rounded-full border border-gray-300 mt-1 flex items-center justify-center text-gray-400 text-xs">SEAL</div>}
        </div>
        <div className="flex-1 flex justify-center">
          {qrCodeBase64 && <img src={qrCodeBase64} alt="QR Verification" className="w-20 h-20 object-contain border border-gray-200 rounded" />}
        </div>
        <div className="text-right text-xs text-gray-500">
          <div className="font-bold">AUTHORIZED REGISTRAR</div>
          {settings?.hod_signature_base64 ? <img src={settings.hod_signature_base64} alt="Signature" className="w-24 h-12 object-contain mt-1" /> : <div className="w-24 h-8 mt-2 border-b border-gray-300" />}
        </div>
      </div>
    </div>
  );
};