import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadResultsPdf(student: Student, settings?: SiteSettings | null): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const leftX = 15, rightX = 195, contentW = 180, brand = settings?.institute_name || 'SKYLINE INSTITUTE';
  let currentY = 15;

  // border
  doc.setDrawColor('#1E3A8A'); doc.setLineWidth(0.6); doc.rect(8, 8, 194, 281, 'S');
  doc.setDrawColor('#94A3B8'); doc.setLineWidth(0.2); doc.rect(10, 10, 190, 277, 'S');

  // photo
  const photoSrc = student.photo_base64, photoW = 24, photoH = 30, photoX = 166, photoY = 15;
  if (photoSrc) addImageSafe(doc, photoSrc, photoX, photoY, photoW, photoH, 'JPEG');
  else { doc.setDrawColor('#94A3B8'); doc.rect(photoX, photoY, photoW, photoH, 'S'); }
  doc.setDrawColor('#1E3A8A'); doc.rect(photoX, photoY, photoW, photoH, 'S');

  // logo + header
  if (settings?.site_logo_base64) addImageSafe(doc, settings.site_logo_base64, leftX, currentY, 24, 12);
  doc.setTextColor('#1E3A8A'); doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text(brand.toUpperCase(), leftX, currentY+16);
  doc.setTextColor('#D97706'); doc.setFontSize(8.5);
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', leftX, currentY+21);
  doc.setTextColor('#475569'); doc.setFont('helvetica','normal'); doc.setFontSize(7);
  doc.text('Academic Registry & Evaluations Office', leftX, currentY+25);
  currentY = 48;
  doc.setDrawColor('#CBD5E1'); doc.line(leftX, currentY, rightX, currentY); currentY += 6;

  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor('#1E1B4B');
  doc.text('OFFICIAL ACADEMIC TRANSCRIPT / CONSOLIDATED MARK SHEET', leftX, currentY);
  const results = student.results_records || [];
  let totalObtained = 0, totalMax = 0;
  results.forEach(r => { totalObtained += Number(r.marks_obtained||0); totalMax += Number(r.max_marks||0); });
  const percentage = totalMax > 0 ? (totalObtained / totalMax)*100 : 0;
  const isPass = percentage >= 33 && results.length > 0;
  const statusLabel = isPass ? `PASSED (${percentage.toFixed(1)}%)` : `FAILED (${percentage.toFixed(1)}%)`;
  const badgeBg = isPass ? '#DCFCE7' : '#FEE2E2', badgeBorder = isPass ? '#86EFAC' : '#FCA5A5', badgeText = isPass ? '#15803D' : '#B91C1C';
  const badgeW = 55, badgeH = 8, badgeX = rightX - badgeW, badgeY = currentY -5;
  doc.setFillColor(badgeBg); doc.rect(badgeX, badgeY, badgeW, badgeH, 'F');
  doc.setDrawColor(badgeBorder); doc.rect(badgeX, badgeY, badgeW, badgeH, 'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(badgeText);
  doc.text(statusLabel, badgeX + badgeW/2, badgeY+5.5, { align:'center' });
  currentY += 12;

  // student profile box
  doc.setFillColor('#F8FAFC'); doc.rect(leftX, currentY, contentW, 26, 'F');
  doc.setDrawColor('#94A3B8'); doc.rect(leftX, currentY, contentW, 26, 'S');
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor('#475569');
  doc.text('Student Full Name:', leftX+4, currentY+6); doc.text('Roll/Registration No:', leftX+4, currentY+12); doc.text('Registered Course:', leftX+4, currentY+18); doc.text('Campus Center:', leftX+4, currentY+24);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  doc.text(student.name.toUpperCase(), leftX+34, currentY+6); doc.text(student.roll_number, leftX+34, currentY+12); doc.text(student.course_name.toUpperCase(), leftX+34, currentY+18); doc.text(student.branch_id || 'Khatima', leftX+34, currentY+24);
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor('#475569');
  doc.text('DB Record ID:', leftX+110, currentY+6); doc.text('Transcript Date:', leftX+110, currentY+12); doc.text('Enrollment Status:', leftX+110, currentY+18);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  doc.text(student.id.toUpperCase(), leftX+142, currentY+6); doc.text(student.reg_date, leftX+142, currentY+12);
  doc.setTextColor(isPass ? '#16A34A' : '#DC2626'); doc.text(isPass ? 'Graduated / Active' : 'Under Evaluation', leftX+142, currentY+18);
  currentY += 34;

  // marks table header
  doc.setFillColor('#1E3A8A'); doc.rect(leftX, currentY, contentW, 8.5, 'F');
  doc.setTextColor('#FFFFFF'); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  doc.text('SUBJECT MODULE PARTICULARS', leftX+4, currentY+5.5); doc.text('EXAM TYPE', leftX+78, currentY+5.5);
  doc.text('MARKS OBTAINED', leftX+112, currentY+5.5); doc.text('MAX MARKS', leftX+142, currentY+5.5); doc.text('RESULT', leftX+168, currentY+5.5);
  currentY += 8.5;

  if (results.length > 0) {
    results.forEach((res, idx) => {
      if (idx%2===1) { doc.setFillColor('#F1F5F9'); doc.rect(leftX, currentY, contentW, 9, 'F'); }
      doc.setDrawColor('#E2E8F0'); doc.line(leftX, currentY+9, rightX, currentY+9);
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor('#1E293B'); doc.text(res.subject, leftX+4, currentY+6);
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.text(res.exam_name, leftX+78, currentY+6);
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor('#1E293B'); doc.text(String(res.marks_obtained), leftX+120, currentY+6, { align:'center' });
      doc.setTextColor('#64748B'); doc.text(String(res.max_marks), leftX+150, currentY+6, { align:'center' });
      const subPct = Number(res.max_marks)>0 ? (Number(res.marks_obtained)/Number(res.max_marks))*100 : 0;
      const subPass = subPct >= 33;
      doc.setTextColor(subPass ? '#16A34A' : '#DC2626'); doc.text(subPass ? 'PASS' : 'FAIL', leftX+168, currentY+6);
      currentY += 9;
    });
  } else {
    doc.setFont('helvetica','italic'); doc.setFontSize(8.5); doc.setTextColor('#94A3B8');
    doc.text('No modular exam records registered yet.', leftX+10, currentY+12); currentY += 20;
  }

  doc.setDrawColor('#1E3A8A'); doc.line(leftX, currentY, rightX, currentY); currentY += 8;

  // summary box
  const sumX = leftX + 90;
  doc.setFillColor('#F8FAFC'); doc.rect(sumX, currentY, 90, 30, 'F');
  doc.setDrawColor('#CBD5E1'); doc.rect(sumX, currentY, 90, 30, 'S');
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor('#475569');
  doc.text('Cumulative Scored Points:', sumX+4, currentY+6); doc.text('Maximum Possible Points:', sumX+4, currentY+12);
  doc.text('Overall Score Percentage:', sumX+4, currentY+18); doc.text('Consolidated Result Status:', sumX+4, currentY+24);
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor('#0F172A');
  doc.text(`${totalObtained} / ${totalMax} Marks`, rightX-4, currentY+6, { align:'right' });
  doc.text(`${totalMax} Marks`, rightX-4, currentY+12, { align:'right' });
  doc.setTextColor(isPass ? '#16A34A' : '#DC2626'); doc.text(`${percentage.toFixed(1)}%`, rightX-4, currentY+18, { align:'right' });
  doc.text(isPass ? 'PASSED (CONSOLIDATED)' : 'FAIL (RE-EVALUATION REQUIRED)', rightX-4, currentY+24, { align:'right' });
  currentY += 40;

  // seal + signature
  doc.setDrawColor('#E2E8F0'); doc.line(leftX, currentY, rightX, currentY); currentY += 6;
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor('#1E1B4B');
  doc.text('ACADEMIC INTEGRITY & REGISTRY AUDIT', leftX, currentY);
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor('#64748B');
  doc.text('This examination record has been verified and recorded in the secure academic ledger.', leftX, currentY+5);

  const sealY2 = currentY + 13;
  const sealB64 = settings?.office_seal_base64, sigB64 = settings?.hod_signature_base64;
  if (sealB64) addImageSafe(doc, sealB64, leftX+16, sealY2, 22, 22);
  else drawOfficialSeal(doc, leftX+27, sealY2+10, 10, false);
  doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor('#475569');
  doc.text('OFFICIAL REGISTRY SEAL', leftX+27, sealY2+25, { align:'center' });

  if (sigB64) addImageSafe(doc, sigB64, rightX-45, sealY2+1, 32, 18);
  else drawDirectorSignature(doc, rightX-45, sealY2+10);
  doc.setDrawColor('#94A3B8'); doc.line(rightX-50, sealY2+18, rightX-10, sealY2+18);
  doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor('#475569');
  doc.text('REGISTRAR (EVALUATION)', rightX-30, sealY2+22, { align:'center' });

  doc.setFillColor('#F8FAFC'); doc.rect(leftX, 260, contentW, 14, 'F');
  doc.setTextColor('#64748B'); doc.setFont('helvetica','italic'); doc.setFontSize(6.5);
  doc.text('1. Verified digital document from student database archive.', leftX+4, 264);
  doc.text('2. Passing eligibility based on cumulative marks >= 33%.', leftX+4, 268);
  doc.text('3. Unauthorized alteration constitutes a legal infraction.', leftX+4, 271);
  doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor('#CBD5E1');
  doc.text(`System Ref: EXM-REC-${student.roll_number}-${Date.now()}`, leftX, 282);

  doc.save(`Exam_Grades_${student.roll_number}.pdf`);
}