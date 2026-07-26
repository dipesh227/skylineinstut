import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

// ---------- Helpers ----------
function generateEnrollmentId(studentId: string, rollNumber: string): string {
  let hash = 178451;
  const str = studentId + rollNumber;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 10000000;
  }
  return `17845${String(hash).padStart(7, '0')}`;
}

function getGraduationDate(student: Student): string {
  const results = student.results_records || [];
  if (results.length === 0) return student.reg_date || '';
  const latest = results.reduce((prev, curr) => {
    const prevDate = prev.created_at ? new Date(prev.created_at).getTime() : 0;
    const currDate = curr.created_at ? new Date(curr.created_at).getTime() : 0;
    return currDate > prevDate ? curr : prev;
  }, results[0]);
  if (latest?.created_at) {
    const d = new Date(latest.created_at);
    return d.toISOString().slice(0,10);
  }
  return student.reg_date || '';
}

function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A1';
  if (percentage >= 80) return 'A2';
  if (percentage >= 70) return 'A3';
  if (percentage >= 60) return 'B1';
  if (percentage >= 50) return 'B2';
  if (percentage >= 40) return 'B3';
  if (percentage >= 33) return 'C1';
  if (percentage >= 25) return 'C2';
  return 'C3';
}

function getClassification(pct: number): string {
  if (pct >= 85) return 'DISTINCTION';
  if (pct >= 75) return 'FIRST CLASS';
  if (pct >= 65) return 'MERIT';
  if (pct >= 50) return 'PASS';
  return 'NEEDS IMPROVEMENT';
}

export function downloadResultsPdf(student: Student, settings?: SiteSettings | null): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = 297, pageHeight = 210;
  const gold = '#B8860B';
  const margin = 6;
  const dividerX = 182;          // separates left certificate from right table
  const rightXStart = 186;
  const rightWidth = 103;

  const instituteName = (settings?.institute_name || 'SKYLINE INSTITUTE').toUpperCase();
  const address = settings?.contact_address || '';

  // ---------- BACKGROUND & GOLDEN BORDERS ----------
  doc.setFillColor('#FAF7EE');
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setDrawColor(gold);
  doc.setLineWidth(1.4);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');
  doc.setLineWidth(0.4);
  doc.rect(margin + 1.5, margin + 1.5, pageWidth - (margin + 1.5) * 2, pageHeight - (margin + 1.5) * 2, 'S');

  // Center divider
  doc.setDrawColor('#D4AF37');
  doc.setLineWidth(0.6);
  doc.line(dividerX, margin + 2, dividerX, pageHeight - margin - 2);

  // ===== LEFT PANEL – PASS OUT CERTIFICATE =====
  const leftCX = (10 + dividerX) / 2;   // center of left panel (~96mm)

  // Institute logo (top‑left)
  const logo = settings?.site_logo_base64 || settings?.logo_url;
  if (logo) addImageSafe(doc, logo, 12, 10, 20, 20);
  // Institute name & address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#0F172A');
  doc.text(instituteName, logo ? 35 : 12, 15);
  doc.setFontSize(6);
  doc.setTextColor('#475569');
  doc.text(address, logo ? 35 : 12, 19);

  // Ribbon
  doc.setFillColor('#0F172A');
  doc.rect(12, 32, 30, 18, 'F');
  doc.setDrawColor(gold);
  doc.setLineWidth(0.5);
  doc.rect(12, 32, 30, 18, 'S');
  doc.setTextColor('#FFD700');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('ACCREDITED', 27, 38, { align: 'center' });
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(4.5);
  doc.text('HOSPITALITY', 27, 43, { align: 'center' });

  // Main title "PASS OUT CERTIFICATE"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor('#0F172A');
  doc.text('PASS OUT CERTIFICATE', leftCX + 10, 37, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(gold);
  doc.text('MIXOLOGY LAB  •  BARTENDING SCHOOL', leftCX + 10, 42, { align: 'center' });
  // Gold box around title
  doc.setDrawColor(gold);
  doc.setLineWidth(0.6);
  doc.rect(leftCX - 42, 30, 104, 15, 'S');

  // Filigree divider
  doc.saveGraphicsState();
  doc.setDrawColor(gold);
  doc.setLineWidth(0.4);
  doc.setFillColor(gold);
  doc.circle(leftCX + 10, 48, 0.8, 'F');
  doc.line(leftCX - 25, 48, leftCX - 3, 48);
  doc.line(leftCX + 23, 48, leftCX + 45, 48);
  doc.restoreGraphicsState();

  // "THIS IS TO CERTIFY THAT"
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#475569');
  doc.text('THIS IS TO CERTIFY THAT', leftCX + 10, 56, { align: 'center' });

  // Student name (large)
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor('#78350F');
  const studentName = student.name.toUpperCase();
  doc.text(studentName, leftCX + 10, 70, { align: 'center' });
  const nameW = doc.getTextWidth(studentName);
  doc.setDrawColor('#94A3B8');
  doc.setLineWidth(0.3);
  doc.line(leftCX + 10 - Math.max(nameW / 2, 45), 73, leftCX + 10 + Math.max(nameW / 2, 45), 73);

  // Statement
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor('#334155');
  const stmt = `has successfully completed the ${student.course_name} at ${instituteName} and has passed the final assessment with excellence.`;
  doc.text(doc.splitTextToSize(stmt, 145), leftCX + 10, 80, { align: 'center' });

  // Course level badge
  const level = student.course_id === 'course-2' ? 'LEVEL 2' : student.course_id === 'course-3' ? 'LEVEL 3' : 'LEVEL 1';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#0F172A');
  doc.text('COURSE LEVEL:', leftCX - 28, 95);
  doc.setFillColor('#C59228');
  doc.rect(leftCX + 5, 91, 35, 6, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(7);
  doc.text(level, leftCX + 22.5, 95, { align: 'center' });

  // Student photo (3:4) – top‑right area of left panel
  const photo = student.photo_base64 || student.photo_url;
  const photoW = 20, photoH = 26.7;
  const photoX = leftCX + 48, photoY = 88;
  if (photo) {
    addImageSafe(doc, photo, photoX, photoY, photoW, photoH, 'JPEG');
  } else {
    doc.setFillColor('#E5E7EB');
    doc.rect(photoX, photoY, photoW, photoH, 'F');
    doc.setFontSize(5);
    doc.setTextColor('#9CA3AF');
    doc.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
  }

  // ----- Bottom area: Dynamic batch, graduation date, seals, signatures -----
  const bottomY = 155;

  // Dynamic batch from roll number
  const batchYear = student.roll_number ? student.roll_number.substring(0, 4) : new Date().getFullYear().toString();
  const batchStr = `BATCH: ${batchYear}-${Number(batchYear) + 1}`;
  const gradDate = getGraduationDate(student);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor('#475569');
  doc.text(batchStr, 14, bottomY);
  doc.setTextColor('#0F172A');
  doc.line(14, bottomY + 0.8, 40, bottomY + 0.8);

  doc.setTextColor('#475569');
  doc.text('DATE OF COMPLETION:', 14, bottomY + 8);
  doc.setTextColor('#0F172A');
  doc.text(gradDate, 48, bottomY + 8);
  doc.line(48, bottomY + 8.8, 72, bottomY + 8.8);

  // Only official signatures: HOD and Office Seal, no static trainer names
  const signY = bottomY + 22;

  // Office Seal (left)
  const sealB64 = settings?.office_seal_base64 || settings?.office_seal_url;
  if (sealB64) {
    addImageSafe(doc, sealB64, 18, signY - 8, 28, 28);
  } else {
    drawOfficialSeal(doc, 32, signY + 6, 12, false);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor('#475569');
  doc.text('OFFICIAL SEAL', 32, signY + 24, { align: 'center' });

  // Center star badge (kept from design)
  const badgeX = leftCX + 10, badgeY = bottomY + 14;
  doc.setFillColor('#0F172A');
  doc.circle(badgeX, badgeY, 15, 'F');
  doc.setDrawColor(gold);
  doc.setLineWidth(1.2);
  doc.circle(badgeX, badgeY, 15, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor('#FFD700');
  doc.text('EXCELLENCE', badgeX, badgeY - 5, { align: 'center' });
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(5);
  doc.text('IN HOSPITALITY', badgeX, badgeY, { align: 'center' });
  doc.setTextColor('#FFD700');
  doc.setFontSize(7);
  doc.text('★ ★ ★ ★ ★', badgeX, badgeY + 6, { align: 'center' });

  // HOD Signature (right)
  const hodSig = settings?.hod_signature_base64 || settings?.hod_signature_url;
  if (hodSig) {
    addImageSafe(doc, hodSig, leftCX + 35, signY - 8, 40, 20);
  } else {
    drawDirectorSignature(doc, leftCX + 35, signY);
  }
  doc.setDrawColor('#94A3B8');
  doc.line(leftCX + 35, signY + 14, leftCX + 75, signY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor('#475569');
  doc.text('HEAD OF TRAINING', leftCX + 55, signY + 18, { align: 'center' });

  // Left footer slogan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(gold);
  doc.text('RAISE THE BAR  •  CREATE EXPERIENCES', leftCX + 10, 198, { align: 'center' });

  // ===== RIGHT PANEL – DYNAMIC ASSESSMENT TABLE =====
  const results = student.results_records || [];
  let grandObt = 0, grandMax = 0;
  results.forEach(r => { grandObt += Number(r.marks_obtained || 0); grandMax += Number(r.max_marks || 0); });
  const pct = grandMax > 0 ? (grandObt / grandMax) * 100 : 0;

  // Table header
  doc.setFillColor('#FFFDF2');
  doc.rect(rightXStart, 10, rightWidth, 8, 'F');
  doc.setDrawColor(gold);
  doc.setLineWidth(0.6);
  doc.rect(rightXStart, 10, rightWidth, 8, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor('#0F172A');
  doc.text('★   FINAL ASSESSMENT RESULT   ★', rightXStart + rightWidth / 2, 15.5, { align: 'center' });

  let y = 20;

  // Group results by exam_name dynamically
  const grouped: Record<string, { subject: string; obt: number; max: number }[]> = {};
  results.forEach(r => {
    const key = r.exam_name || 'EXAM';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ subject: r.subject, obt: Number(r.marks_obtained || 0), max: Number(r.max_marks || 0) });
  });

  for (const [exam, subs] of Object.entries(grouped)) {
    // Category header
    doc.setFillColor('#C59228');
    doc.rect(rightXStart, y, rightWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor('#FFFFFF');
    doc.text(exam, rightXStart + 2, y + 3.5);
    doc.setFontSize(5.5);
    doc.text('MAX MARKS', rightXStart + 66, y + 3.5, { align: 'center' });
    doc.text('OBTAINED', rightXStart + 88, y + 3.5, { align: 'center' });
    y += 5;

    let catObt = 0;
    subs.forEach(sub => {
      catObt += sub.obt;
      doc.setDrawColor('#CBD5E1');
      doc.setLineWidth(0.2);
      doc.rect(rightXStart, y, rightWidth, 4.2, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor('#1E293B');
      doc.text(sub.subject, rightXStart + 2, y + 3, { maxWidth: 60 });
      doc.setFont('helvetica', 'bold');
      doc.text(String(sub.max), rightXStart + 66, y + 3, { align: 'center' });
      doc.text(String(sub.obt), rightXStart + 88, y + 3, { align: 'center' });
      y += 4.2;
    });

    // Subtotal
    doc.setFillColor('#FEF3C7');
    doc.rect(rightXStart, y, rightWidth, 4.5, 'F');
    doc.setDrawColor(gold);
    doc.setLineWidth(0.3);
    doc.rect(rightXStart, y, rightWidth, 4.5, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor('#0F172A');
    doc.text('TOTAL', rightXStart + 50, y + 3.2, { align: 'right' });
    const catMax = subs.reduce((s, sub) => s + sub.max, 0);
    doc.text(String(catMax), rightXStart + 66, y + 3.2, { align: 'center' });
    doc.text(String(catObt), rightXStart + 88, y + 3.2, { align: 'center' });
    y += 5.5;
  }

  // Grand total
  doc.setFillColor('#C59228');
  doc.rect(rightXStart, y, rightWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor('#FFFFFF');
  doc.text('GRAND TOTAL', rightXStart + 50, y + 4, { align: 'right' });
  doc.text(String(grandMax), rightXStart + 66, y + 4, { align: 'center' });
  doc.text(String(grandObt), rightXStart + 88, y + 4, { align: 'center' });
  y += 9;

  // Classification checkboxes
  const isDist = pct >= 85, isFirst = pct >= 75 && pct < 85, isMerit = pct >= 65 && pct < 75, isPass = pct >= 50 && pct < 65, isNeeds = pct < 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor('#475569');
  doc.text('RESULT CLASSIFICATION:', rightXStart, y);
  y += 4;

  const drawCheck = (label: string, checked: boolean, yy: number) => {
    doc.setDrawColor('#475569');
    doc.setLineWidth(0.3);
    doc.rect(rightXStart, yy - 2.5, 3, 3, 'S');
    if (checked) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor('#15803D');
      doc.text('X', rightXStart + 0.6, yy - 0.2);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(checked ? '#0F172A' : '#64748B');
    doc.text(label, rightXStart + 5, yy);
  };

  drawCheck('DISTINCTION (85% & ABOVE)', isDist, y);
  drawCheck('FIRST CLASS (75% - 84%)', isFirst, y + 4.5);
  drawCheck('MERIT (65% - 74%)', isMerit, y + 9);
  drawCheck('PASS (50% - 64%)', isPass, y + 13.5);
  drawCheck('NEEDS IMPROVEMENT (<50%)', isNeeds, y + 18);

  // Percentage box
  const pBoxX = rightXStart + 65, pBoxY = y - 2;
  doc.setFillColor('#FFFDF2');
  doc.rect(pBoxX, pBoxY, 36, 21, 'F');
  doc.setDrawColor(gold);
  doc.setLineWidth(0.8);
  doc.rect(pBoxX, pBoxY, 36, 21, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(gold);
  doc.text('PERCENTAGE', pBoxX + 18, pBoxY + 6, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor('#0F172A');
  doc.text(`${pct.toFixed(1)}%`, pBoxX + 18, pBoxY + 16, { align: 'center' });

  doc.save(`Result_Sheet_${student.roll_number}.pdf`);
}