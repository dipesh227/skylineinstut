import React, { useEffect, useState } from "react";
import { Student, SiteSettings } from "@/types";
import { generateCertificateBlob } from "@/lib/pdf/Certificate";

interface Props {
  student: Student;
  settings: SiteSettings | null;
  qrCodeBase64: string;
}

export const DegreeCertificate: React.FC<Props> = ({
  student,
  settings,
  qrCodeBase64,
}) => {
  const [blobUrl, setBlobUrl] = useState<string>("");

  useEffect(() => {
    const blob = generateCertificateBlob(student, settings, qrCodeBase64);
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    // Cleanup blob URL when component unmounts or props change
    return () => URL.revokeObjectURL(url);
  }, [student, settings, qrCodeBase64]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `Certificate_${student.roll_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!blobUrl) return;
    const iframe = document.createElement("iframe");
    iframe.src = blobUrl;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-2">
      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
        >
          Print
        </button>
      </div>

      {/* PDF Preview via iframe */}
      {blobUrl ? (
        <iframe
          src={blobUrl}
          className="w-full h-[500px] border border-gray-300 rounded"
          title="Certificate Preview"
        />
      ) : (
        <div className="text-center py-20 text-gray-500">
          Generating preview...
        </div>
      )}
    </div>
  );
};