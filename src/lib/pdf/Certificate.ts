import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadCertificatePdf(student: Student, settings?: SiteSettings | null, qrCodeBase64?: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const brand = settings?.institute_name || 'SKYLINE INSTITUTE';

  // golden background + border
  doc.setFillColor('#FFFBEB'); doc.rect(0, 0, 297, 210, 'F');
  doc.setDrawColor('#D97706'); doc.setLineWidth(1.5); doc.rect(10, 10, 277, 190, 'S');
  doc.setDrawColor('#F59E0B'); doc.setLineWidth(0.4); doc.rect(13, 13, 271, 184, 'S');
  doc.setFillColor('#D97706'); doc.rect(10,10,5,5,'F'); doc.rect(282,10,5,5,'F'); doc.rect(10,195,5,5,'F'); doc.rect(282,195,5,5,'F');

  // logo top left
  const logoBase = settings?.site_logo_base64;
  if (logoBase) addImageSafe(doc, logoBase, 20, 20, 42, 21);

  // student photo (3:4) top right
  const photoSrc = student.photo_base64;
  const photoW = 28, photoH = 35, photoX = 249, photoY = 20;
  if (photoSrc) addImageSafe(doc, photoSrc, photoX, photoY, photoW, photoH, 'JPEG');
  else { doc.setDrawColor('#D97706'); doc.rect(photoX, photoY, photoW, photoH, 'S'); }

  // header
  doc.setTextColor('#78350F'); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  doc.text('ACADEMIC REGISTRY & GRADUATION SERVICES', 148.5, 34, { align:'center' });
  doc.setTextColor('#0F172A'); doc.setFont('times','bold'); doc.setFontSize(28);
  doc.text(brand.toUpperCase(), 148.5, 46, { align:'center' });
  doc.setTextColor('#D97706'); doc.setFont('helvetica','bold'); doc.setFontSize(9.5);
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', 148.5, 52, { align:'center' });
  doc.setDrawColor('#CBD5E1'); doc.line(100, 58, 197, 58);

  doc.setTextColor('#475569'); doc.setFont('times','italic'); doc.setFontSize(13);
  doc.text('This is to officially certify that the candidate', 148.5, 70, { align:'center' });
  doc.setTextColor('#1E1B4B'); doc.setFont('helvetica','bold'); doc.setFontSize(24);
  doc.text(student.name.toUpperCase(), 148.5, 84, { align:'center' });
  doc.setDrawColor('#C7D2FE'); doc.line(60, 88, 237, 88);
  doc.setTextColor('#334155'); doc.setFont('times','italic'); doc.setFontSize(12);
  const narrative = 'has successfully fulfilled all institutional criteria, practical skill assessments, and academic examinations, and is hereby awarded the professional credentials for the program:';
  doc.text(doc.splitTextToSize(narrative, 210), 148.5, 96, { align:'center' });

  const courseText = student.course_name.toUpperCase();
  const boxW = Math.max(doc.getTextWidth(courseText)+16, 100);
  const boxX = 148.5 - boxW/2, boxY = 112;
  doc.setFillColor('#FEF3C7'); doc.rect(boxX, boxY, boxW, 10, 'F');
  doc.setDrawColor('#FCD34D'); doc.rect(boxX, boxY, boxW, 10, 'S');
  doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text(courseText, 148.5, boxY+6.5, { align:'center' });

  // info grid
  doc.setDrawColor('#E2E8F0'); doc.line(50, 138, 247, 138);
  const colY = 144, colValY = 150;
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor('#94A3B8');
  doc.text('ROLL NUMBER', 75, colY, { align:'center' }); doc.text('GRADUATION DATE', 125, colY, { align:'center' });
  doc.text('ENROLLMENT ID', 175, colY, { align:'center' }); doc.text('STATUS', 222, colY, { align:'center' });
  doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor('#1E293B');
  doc.text(student.roll_number, 75, colValY, { align:'center' }); doc.text(student.reg_date, 125, colValY, { align:'center' });
  doc.text(student.id.replace('student-','').toUpperCase(), 175, colValY, { align:'center' });
  const results = student.results_records || [];
  let totalObtained = 0, totalMax = 0;
  results.forEach(r => { totalObtained += Number(r.marks_obtained||0); totalMax += Number(r.max_marks||0); });
  const certPercentage = totalMax > 0 ? (totalObtained / totalMax)*100 : 85;
  doc.setTextColor('#059669'); doc.text(`${certPercentage.toFixed(1)}% Passed`, 222, colValY, { align:'center' });
  doc.setDrawColor('#E2E8F0'); doc.line(50, 156, 247, 156);

  // seals + QR
  const sealY = 168;
  const sealB64 = settings?.office_seal_base64, sigB64 = settings?.hod_signature_base64;
  if (sealB64) addImageSafe(doc, sealB64, 32, sealY, 20, 20);
  else drawOfficialSeal(doc, 42, sealY+10, 10, false);
  doc.setTextColor('#64748B'); doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
  doc.text('OFFICIAL SEAL', 42, sealY+26, { align:'center' });

  // QR code centre (larger)
  if (qrCodeBase64) {
    doc.setFillColor('#FFFFFF'); doc.rect(148.5-15, sealY-5, 30, 30, 'F');
    doc.setDrawColor('#F59E0B'); doc.setLineWidth(0.4); doc.rect(148.5-15, sealY-5, 30, 30, 'S');
    addImageSafe(doc, qrCodeBase64, 148.5-14, sealY-4, 28, 28, 'PNG');
    doc.setFontSize(5); doc.setTextColor('#64748B');
    doc.text('Scan to verify', 148.5, sealY+27, { align:'center' });
  }

  if (sigB64) addImageSafe(doc, sigB64, 228, sealY-1, 32, 18);
  else drawDirectorSignature(doc, 228, sealY+7);
  doc.setDrawColor('#94A3B8'); doc.line(222, sealY+18, 262, sealY+18);
  doc.setTextColor('#64748B'); doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
  doc.text('AUTHORIZED REGISTRAR', 242, sealY+23, { align:'center' });

  doc.save(`DiplomaCertificate_${student.roll_number}.pdf`);
}