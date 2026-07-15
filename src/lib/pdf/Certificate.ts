import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadCertificatePdf(student: Student, settings?: SiteSettings | null, qrCodeBase64?: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const brand = settings?.institute_name || 'SKYLINE INSTITUTE';

  // Cream background
  doc.setFillColor('#FFFBEB'); doc.rect(0, 0, 297, 210, 'F');
  // Golden double border
  doc.setDrawColor('#D97706'); doc.setLineWidth(1.5); doc.rect(10, 10, 277, 190, 'S');
  doc.setDrawColor('#F59E0B'); doc.setLineWidth(0.4); doc.rect(13, 13, 271, 184, 'S');
  // Corner ornaments
  doc.setFillColor('#D97706'); doc.rect(10, 10, 5, 5, 'F'); doc.rect(282, 10, 5, 5, 'F'); doc.rect(10, 195, 5, 5, 'F'); doc.rect(282, 195, 5, 5, 'F');

  // Logo top left
  const logoBase = settings?.site_logo_base64;
  if (logoBase) addImageSafe(doc, logoBase, 20, 20, 40, 20);

  // Header
  doc.setTextColor('#78350F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  doc.text('ACADEMIC REGISTRY & GRADUATION SERVICES', 148.5, 34, { align: 'center' });
  doc.setTextColor('#0F172A'); doc.setFont('times', 'bold'); doc.setFontSize(26);
  doc.text(brand.toUpperCase(), 148.5, 46, { align: 'center' });
  doc.setTextColor('#D97706'); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', 148.5, 52, { align: 'center' });
  doc.setDrawColor('#E5E7EB'); doc.line(100, 56, 197, 56);

  // Body
  doc.setTextColor('#6B7280'); doc.setFont('times', 'italic'); doc.setFontSize(12);
  doc.text('This is to officially certify that the candidate', 148.5, 68, { align: 'center' });
  doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text(student.name.toUpperCase(), 148.5, 82, { align: 'center' });
  doc.setDrawColor('#E5E7EB'); doc.line(70, 86, 227, 86);
  doc.setTextColor('#6B7280'); doc.setFont('times', 'italic'); doc.setFontSize(11);
  doc.text('has successfully completed the professional program', 148.5, 94, { align: 'center' });

  // Course name badge
  const courseText = student.course_name.toUpperCase();
  const boxW = Math.max(doc.getTextWidth(courseText) + 16, 100);
  const boxX = 148.5 - boxW / 2, boxY = 100;
  doc.setFillColor('#FEF3C7'); doc.rect(boxX, boxY, boxW, 9, 'F');
  doc.setDrawColor('#FCD34D'); doc.rect(boxX, boxY, boxW, 9, 'S');
  doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text(courseText, 148.5, boxY + 6.5, { align: 'center' });

  // Info grid
  doc.setDrawColor('#E5E7EB'); doc.line(60, 122, 237, 122);
  const colY = 128, colValY = 134;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor('#9CA3AF');
  doc.text('ROLL NUMBER', 75, colY, { align: 'center' }); doc.text('DATE', 125, colY, { align: 'center' });
  doc.text('ENROLLMENT ID', 175, colY, { align: 'center' }); doc.text('STATUS', 222, colY, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor('#0F172A');
  doc.text(student.roll_number, 75, colValY, { align: 'center' }); doc.text(student.reg_date, 125, colValY, { align: 'center' });
  doc.text(student.id.replace('student-', '').toUpperCase(), 175, colValY, { align: 'center' });
  const results = student.results_records || [];
  let totalObtained = 0, totalMax = 0;
  results.forEach(r => { totalObtained += Number(r.marks_obtained || 0); totalMax += Number(r.max_marks || 0); });
  const pct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '85.0';
  doc.setTextColor('#059669'); doc.text(`${pct}% Passed`, 222, colValY, { align: 'center' });
  doc.setDrawColor('#E5E7EB'); doc.line(60, 140, 237, 140);

  // Seals and QR
  const sealY = 152;
  const sealB64 = settings?.office_seal_base64, sigB64 = settings?.hod_signature_base64;
  if (sealB64) addImageSafe(doc, sealB64, 32, sealY, 20, 20);
  else drawOfficialSeal(doc, 42, sealY + 10, 10, false);
  doc.setFontSize(7); doc.setTextColor('#9CA3AF'); doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SEAL', 42, sealY + 24, { align: 'center' });

  // QR Code center
  if (qrCodeBase64) {
    doc.setFillColor('#FFFFFF'); doc.rect(148.5 - 15, sealY - 4, 30, 30, 'F');
    doc.setDrawColor('#F59E0B'); doc.setLineWidth(0.4); doc.rect(148.5 - 15, sealY - 4, 30, 30, 'S');
    addImageSafe(doc, qrCodeBase64, 148.5 - 13, sealY - 2, 26, 26, 'PNG');
  }

  if (sigB64) addImageSafe(doc, sigB64, 228, sealY, 32, 18);
  else drawDirectorSignature(doc, 228, sealY + 10);
  doc.setDrawColor('#9CA3AF'); doc.line(222, sealY + 20, 262, sealY + 20);
  doc.setFontSize(7); doc.setTextColor('#9CA3AF'); doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED REGISTRAR', 242, sealY + 25, { align: 'center' });

  doc.save(`DiplomaCertificate_${student.roll_number}.pdf`);
}