import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadResultsPdf(student: Student, settings?: SiteSettings | null): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const leftX = 15, rightX = 195, contentW = 180, brand = settings?.institute_name || 'SKYLINE INSTITUTE';
  let currentY = 15;

  // Borders
  doc.setDrawColor('#1E3A8A'); doc.setLineWidth(0.6); doc.rect(8, 8, 194, 281, 'S');
  doc.setDrawColor('#9CA3AF'); doc.setLineWidth(0.2); doc.rect(10, 10, 190, 277, 'S');

  // Logo + Header
  if (settings?.site_logo_base64) addImageSafe(doc, settings.site_logo_base64, leftX, currentY, 22, 11);
  doc.setTextColor('#1E3A8A'); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
  doc.text(brand.toUpperCase(), leftX, currentY + 14);
  doc.setTextColor('#D97706'); doc.setFontSize(8);
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', leftX, currentY + 18);
  doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.text('Academic Registry & Evaluations Office', leftX, currentY + 21);
  currentY = 45;
  doc.setDrawColor('#E5E7EB'); doc.line(leftX, currentY, rightX, currentY); currentY += 6;

  // Title
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor('#0F172A');
  doc.text('OFFICIAL ACADEMIC TRANSCRIPT', leftX, currentY);
  currentY += 6;

  // Status badge
  const results = student.results_records || [];
  let totalObtained = 0, totalMax = 0;
  results.forEach(r => { totalObtained += Number(r.marks_obtained || 0); totalMax += Number(r.max_marks || 0); });
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const isPass = percentage >= 33 && results.length > 0;
  const badgeBg = isPass ? '#DCFCE7' : '#FEE2E2', badgeText = isPass ? '#15803D' : '#B91C1C';
  const badgeW = 50, badgeH = 7;
  doc.setFillColor(badgeBg); doc.rect(rightX - badgeW, currentY - 3, badgeW, badgeH, 'F');
  doc.setFontSize(7); doc.setTextColor(badgeText); doc.setFont('helvetica', 'bold');
  doc.text(isPass ? `PASSED (${percentage.toFixed(1)}%)` : `FAILED (${percentage.toFixed(1)}%)`, rightX - badgeW / 2, currentY + 2, { align: 'center' });
  currentY += 10;

  // Student info
  doc.setFillColor('#F9FAFB'); doc.rect(leftX, currentY, contentW, 22, 'F');
  doc.setDrawColor('#E5E7EB'); doc.rect(leftX, currentY, contentW, 22, 'S');
  doc.setFontSize(8); doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text('Name:', leftX + 4, currentY + 5); doc.text(student.name.toUpperCase(), leftX + 30, currentY + 5);
  doc.text('Roll No:', leftX + 4, currentY + 10); doc.text(student.roll_number, leftX + 30, currentY + 10);
  doc.text('Course:', leftX + 4, currentY + 15); doc.text(student.course_name, leftX + 30, currentY + 15);
  doc.text('Date:', leftX + 110, currentY + 5); doc.text(student.reg_date, leftX + 130, currentY + 5);
  doc.text('Status:', leftX + 110, currentY + 10); doc.text(isPass ? 'Graduated' : 'Under Evaluation', leftX + 130, currentY + 10);
  currentY += 28;

  // Marks table
  doc.setFillColor('#1E3A8A'); doc.rect(leftX, currentY, contentW, 8, 'F');
  doc.setFontSize(8); doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'bold');
  doc.text('Subject', leftX + 4, currentY + 5.5);
  doc.text('Exam', leftX + 80, currentY + 5.5);
  doc.text('Obtained', leftX + 120, currentY + 5.5);
  doc.text('Max', leftX + 145, currentY + 5.5);
  doc.text('Result', leftX + 170, currentY + 5.5);
  currentY += 8;

  if (results.length > 0) {
    results.forEach((res, idx) => {
      if (idx % 2 === 1) { doc.setFillColor('#F9FAFB'); doc.rect(leftX, currentY, contentW, 8, 'F'); }
      doc.setFontSize(7.5); doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
      doc.text(res.subject, leftX + 4, currentY + 5);
      doc.setFont('helvetica', 'normal'); doc.setTextColor('#6B7280');
      doc.text(res.exam_name, leftX + 80, currentY + 5);
      doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
      doc.text(String(res.marks_obtained), leftX + 125, currentY + 5, { align: 'center' });
      doc.setTextColor('#6B7280'); doc.text(String(res.max_marks), leftX + 150, currentY + 5, { align: 'center' });
      const subPct = Number(res.max_marks) > 0 ? (Number(res.marks_obtained) / Number(res.max_marks)) * 100 : 0;
      doc.setTextColor(subPct >= 33 ? '#16A34A' : '#DC2626');
      doc.text(subPct >= 33 ? 'PASS' : 'FAIL', leftX + 175, currentY + 5, { align: 'center' });
      currentY += 8;
    });
  } else {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor('#9CA3AF');
    doc.text('No exam records registered.', leftX + 10, currentY + 10);
    currentY += 18;
  }

  doc.setDrawColor('#1E3A8A'); doc.line(leftX, currentY, rightX, currentY); currentY += 8;

  // Summary
  const sumX = leftX + 100;
  doc.setFillColor('#F9FAFB'); doc.rect(sumX, currentY, 80, 24, 'F');
  doc.setDrawColor('#E5E7EB'); doc.rect(sumX, currentY, 80, 24, 'S');
  doc.setFontSize(8); doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text('Total:', sumX + 4, currentY + 6);
  doc.text('Percentage:', sumX + 4, currentY + 13);
  doc.text('Result:', sumX + 4, currentY + 20);
  doc.setFont('helvetica', 'bold'); doc.setTextColor('#0F172A');
  doc.text(`${totalObtained} / ${totalMax}`, rightX - 4, currentY + 6, { align: 'right' });
  doc.setTextColor(isPass ? '#16A34A' : '#DC2626');
  doc.text(`${percentage.toFixed(1)}%`, rightX - 4, currentY + 13, { align: 'right' });
  doc.text(isPass ? 'PASSED' : 'FAILED', rightX - 4, currentY + 20, { align: 'right' });
  currentY += 32;

  // Seals
  doc.setDrawColor('#E5E7EB'); doc.line(leftX, currentY, rightX, currentY); currentY += 6;
  const sealB64 = settings?.office_seal_base64, sigB64 = settings?.hod_signature_base64;
  if (sealB64) addImageSafe(doc, sealB64, leftX + 16, currentY, 20, 20);
  else drawOfficialSeal(doc, leftX + 26, currentY + 10, 10, false);
  doc.setFontSize(7); doc.setTextColor('#9CA3AF'); doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SEAL', leftX + 26, currentY + 23, { align: 'center' });

  if (sigB64) addImageSafe(doc, sigB64, rightX - 50, currentY + 2, 28, 16);
  else drawDirectorSignature(doc, rightX - 50, currentY + 10);
  doc.setDrawColor('#9CA3AF'); doc.line(rightX - 55, currentY + 20, rightX - 10, currentY + 20);
  doc.setFontSize(7); doc.setTextColor('#9CA3AF'); doc.text('REGISTRAR (EVALUATION)', rightX - 32, currentY + 25, { align: 'center' });

  doc.save(`Exam_Grades_${student.roll_number}.pdf`);
}