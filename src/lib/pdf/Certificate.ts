import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';

// ---------- Helper: Vector fallback seal ----------
function drawVectorSeal(doc: jsPDF, centerX: number, centerY: number, radius: number) {
  doc.saveGraphicsState();
  const sealColor = '#1E3A8A';
  doc.setDrawColor(sealColor);
  doc.setTextColor(sealColor);
  doc.setLineWidth(0.8);
  doc.circle(centerX, centerY, radius, 'S');
  doc.setLineWidth(0.3);
  doc.circle(centerX, centerY, radius - 1.2, 'S');
  doc.circle(centerX, centerY, radius - 5.5, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.text('SKYLINE INSTITUTE OF MANAGEMENT', centerX, centerY - 6.5, { align: 'center' });
  doc.setFontSize(3.5);
  doc.text('MANAGEMENT, HOSPITALITY &', centerX, centerY - 1.5, { align: 'center' });
  doc.text('BARTENDING ACADEMY', centerX, centerY + 1.2, { align: 'center' });
  doc.setFontSize(6);
  doc.text('★  ★', centerX, centerY + 5, { align: 'center' });
  doc.restoreGraphicsState();
}

// ---------- Ornamental divider ----------
function drawFiligreeDivider(doc: jsPDF, centerX: number, centerY: number) {
  doc.saveGraphicsState();
  doc.setDrawColor('#B8860B');
  doc.setLineWidth(0.4);
  doc.setFillColor('#B8860B');
  doc.circle(centerX, centerY, 0.8, 'F');
  doc.line(centerX - 25, centerY, centerX - 3, centerY);
  doc.line(centerX + 3, centerY, centerX + 25, centerY);
  doc.circle(centerX - 25, centerY, 0.5, 'S');
  doc.circle(centerX + 25, centerY, 0.5, 'S');
  doc.restoreGraphicsState();
}

// ---------- Vector signature fallback ----------
function drawVectorSignature(doc: jsPDF, startX: number, startY: number) {
  doc.saveGraphicsState();
  doc.setDrawColor('#0F172A');
  doc.setLineWidth(0.4);
  doc.line(startX, startY, startX + 6, startY - 4);
  doc.line(startX + 6, startY - 4, startX + 10, startY + 2);
  doc.line(startX + 10, startY + 2, startX + 14, startY - 5);
  doc.line(startX + 14, startY - 5, startX + 20, startY - 1);
  doc.line(startX + 20, startY - 1, startX + 26, startY - 4);
  doc.line(startX - 2, startY + 2, startX + 30, startY + 1);
  doc.restoreGraphicsState();
}

// ---------- Fallback QR grid ----------
function drawFallbackQrGrid(doc: jsPDF, x: number, y: number, size: number) {
  doc.saveGraphicsState();
  doc.setFillColor('#000000');
  const cells = 8;
  const cellSize = size / cells;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if ((r + c) % 2 === 0 || (r === 0 && c < 3) || (r < 3 && c === 0) || (r === cells - 1 && c >= cells - 3)) {
        doc.rect(x + c * cellSize, y + r * cellSize, cellSize - 0.2, cellSize - 0.2, 'F');
      }
    }
  }
  doc.restoreGraphicsState();
}

// ---------- Emblem badge fallback ----------
function drawEmblemBadge(doc: jsPDF, centerX: number, centerY: number) {
  doc.saveGraphicsState();
  doc.setDrawColor('#B8860B');
  doc.setLineWidth(1.2);
  doc.circle(centerX, centerY, 15, 'S');
  doc.setLineWidth(0.4);
  doc.circle(centerX, centerY, 13.5, 'S');
  doc.setFillColor('#1E3A8A');
  doc.circle(centerX, centerY, 12, 'F');
  doc.setFillColor('#FFFFFF');
  doc.rect(centerX - 6, centerY + 2, 3, 5, 'F');
  doc.rect(centerX - 2, centerY - 1, 4, 8, 'F');
  doc.rect(centerX + 3, centerY + 1, 3, 6, 'F');
  doc.setFillColor('#FFD700');
  doc.lines([[7, 3], [-7, 3], [-7, -3]], centerX, centerY - 7, [1, 1], 'F', true);
  doc.restoreGraphicsState();
}

// ---------- Grade calculator ----------
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

// ---------- Enrollment ID helper ----------
function generateEnrollmentId(studentId: string, rollNumber: string): string {
  let hash = 178451;
  const str = studentId + rollNumber;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 10000000;
  }
  return `17845${String(hash).padStart(7, '0')}`;
}

// ---------- MAIN CERTIFICATE GENERATOR ----------
export function downloadCertificatePdf(
  student: Student,
  settings?: SiteSettings | null,
  qrCodeBase64?: string
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = 297;
  const pageHeight = 210;
  const centerX = pageWidth / 2;

  // Background
  doc.setFillColor('#FAF7EE');
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Golden borders
  const goldColor = '#B8860B';
  const frameMargin = 8;
  const innerMargin = 11;
  doc.setDrawColor(goldColor);
  doc.setLineWidth(1.8);
  doc.rect(frameMargin, frameMargin, pageWidth - frameMargin * 2, pageHeight - frameMargin * 2, 'S');
  doc.setLineWidth(0.4);
  doc.rect(innerMargin, innerMargin, pageWidth - innerMargin * 2, pageHeight - innerMargin * 2, 'S');

  // Corner accents
  const cornerSize = 4;
  doc.setFillColor(goldColor);
  doc.rect(frameMargin, frameMargin, cornerSize, cornerSize, 'F');
  doc.rect(pageWidth - frameMargin - cornerSize, frameMargin, cornerSize, cornerSize, 'F');
  doc.rect(frameMargin, pageHeight - frameMargin - cornerSize, cornerSize, cornerSize, 'F');
  doc.rect(pageWidth - frameMargin - cornerSize, pageHeight - frameMargin - cornerSize, cornerSize, cornerSize, 'F');

  // Logo
  const logoSrc = settings?.site_logo_base64?.trim() || settings?.logo_url?.trim() || '';
  if (logoSrc) {
    try { doc.addImage(logoSrc, 'PNG', 18, 16, 36, 36); } catch (e) { drawEmblemBadge(doc, 36, 34); }
  } else {
    drawEmblemBadge(doc, 36, 34);
  }

  // Header (with refined typography)
  doc.setTextColor('#8B0000');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ACADEMIC REGISTRY & GRADUATION SERVICES', centerX, 24, { align: 'center' });

  // Institute name – elegant serif, static
  doc.setTextColor('#0F172A');
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('SKYLINE INSTITUTE OF MANAGEMENT,', centerX, 33, { align: 'center' });
  doc.text('HOSPITALITY & BARTENDING', centerX, 41, { align: 'center' });

  // Subtitle – refined gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor('#B8860B');
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', centerX, 48, { align: 'center' });

  // Divider
  drawFiligreeDivider(doc, centerX, 53);

  // Narrative – elegant italic
  doc.setTextColor('#475569');
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.text('This is to officially certify that the candidate', centerX, 64, { align: 'center' });

  // Student name – larger, with a subtle underline
  doc.setTextColor('#0F172A');
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  const studentName = student.name.toUpperCase();
  doc.text(studentName, centerX, 78, { align: 'center' });

  const nameWidth = doc.getTextWidth(studentName);
  const underlineW = Math.max(nameWidth + 20, 160);
  doc.setDrawColor('#CBD5E1');
  doc.setLineWidth(0.4);
  doc.line(centerX - underlineW / 2, 82, centerX + underlineW / 2, 82);

  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.text('has successfully completed the professional program', centerX, 92, { align: 'center' });

  // Course box – refined
  const courseText = student.course_name.toUpperCase();
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  const courseWidth = doc.getTextWidth(courseText);
  const boxWidth = Math.max(courseWidth + 24, 140);
  const boxHeight = 13;
  const boxX = centerX - boxWidth / 2;
  const boxY = 98;

  doc.setFillColor('#FFFDF2');
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');
  doc.setDrawColor('#B8860B');
  doc.setLineWidth(0.8);
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');
  doc.setLineWidth(0.3);
  doc.rect(boxX + 0.8, boxY + 0.8, boxWidth - 1.6, boxHeight - 1.6, 'S');
  doc.setTextColor('#0F172A');
  doc.text(courseText, centerX, boxY + 8.5, { align: 'center' });

  // Metadata rows
  const metaYTop = 118;
  const metaYBot = metaYTop + 22;
  const metaYTextLabel = metaYTop + 6;
  const metaYTextVal = metaYTop + 15;

  doc.setDrawColor('#94A3B8');
  doc.setLineWidth(0.4);
  doc.line(35, metaYTop, pageWidth - 35, metaYTop);
  doc.line(35, metaYBot, pageWidth - 35, metaYBot);

  const col1X = 62; const col2X = 118; const col3X = 178; const col4X = 238;
  doc.setDrawColor('#CBD5E1');
  doc.setLineWidth(0.3);
  doc.line(90, metaYTop + 2, 90, metaYBot - 2);
  doc.line(148, metaYTop + 2, 148, metaYBot - 2);
  doc.line(208, metaYTop + 2, 208, metaYBot - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#64748B');
  doc.text('ROLL NUMBER', col1X, metaYTextLabel, { align: 'center' });
  doc.text('DATE', col2X, metaYTextLabel, { align: 'center' });
  doc.text('ENROLLMENT ID', col3X, metaYTextLabel, { align: 'center' });
  doc.text('GRADE', col4X, metaYTextLabel, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#0F172A');
  doc.text(student.roll_number, col1X, metaYTextVal, { align: 'center' });
  doc.text(student.reg_date || '2026-07-20', col2X, metaYTextVal, { align: 'center' });
  doc.text(generateEnrollmentId(student.id, student.roll_number), col3X, metaYTextVal, { align: 'center' });

  // Grade from percentage
  const certResults = student.results_records || [];
  let totalObt = 0, totalMax = 0;
  certResults.forEach(r => { totalObt += Number(r.marks_obtained || 0); totalMax += Number(r.max_marks || 0); });
  const percentage = totalMax > 0 ? (totalObt / totalMax) * 100 : 100;
  const grade = getGrade(percentage);
  doc.setTextColor('#15803D');
  doc.text(grade, col4X, metaYTextVal, { align: 'center' });

  // Bottom row: seal, QR, signature
  const bottomY = metaYBot + 10;

  // Seal
  const sealSrc = settings?.office_seal_base64?.trim() || settings?.office_seal_url?.trim() || '';
  if (sealSrc) {
    try { doc.addImage(sealSrc, 'PNG', 35, bottomY, 32, 32); } catch (e) { drawVectorSeal(doc, 51, bottomY + 16, 15); }
  } else {
    drawVectorSeal(doc, 51, bottomY + 16, 15);
  }

  // QR code
  const qrBoxSize = 34;
  const qrBoxX = centerX - qrBoxSize / 2;
  const qrBoxY = bottomY - 2;
  doc.setFillColor('#FFFFFF');
  doc.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 'F');
  doc.setDrawColor('#B8860B');
  doc.setLineWidth(0.6);
  doc.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 'S');
  if (qrCodeBase64) {
    try { doc.addImage(qrCodeBase64, 'PNG', qrBoxX + 1.5, qrBoxY + 1.5, qrBoxSize - 3, qrBoxSize - 3); } catch (e) { drawFallbackQrGrid(doc, qrBoxX + 2, qrBoxY + 2, qrBoxSize - 4); }
  } else {
    drawFallbackQrGrid(doc, qrBoxX + 2, qrBoxY + 2, qrBoxSize - 4);
  }

  // Signature
  const rightSignX = pageWidth - 65;
  const signatureSrc = settings?.hod_signature_base64?.trim() || settings?.hod_signature_url?.trim() || '';
  if (signatureSrc) {
    try { doc.addImage(signatureSrc, 'PNG', rightSignX - 15, bottomY + 2, 30, 12); } catch (e) { drawVectorSignature(doc, rightSignX - 15, bottomY + 8); }
  } else {
    drawVectorSignature(doc, rightSignX - 15, bottomY + 8);
  }
  doc.setDrawColor('#64748B');
  doc.setLineWidth(0.4);
  doc.line(rightSignX - 25, bottomY + 18, rightSignX + 25, bottomY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#334155');
  doc.text('AUTHORIZED REGISTRAR', rightSignX, bottomY + 23, { align: 'center' });

  doc.save(`Official_Degree_Certificate_${student.roll_number}.pdf`);
}