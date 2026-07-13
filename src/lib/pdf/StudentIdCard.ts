import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadStudentIdPdf(student: Student, settings?: SiteSettings | null): void {
  const W = 120, H = 75;  // landscape card exactly 120 x 75 mm
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });

  const mx = W * 0.06;      // left/right margin
  const my = H * 0.07;      // top/bottom margin
  const cw = W - 2 * mx;    // content width
  const ch = H - 2 * my;    // content height

  const brand = settings?.institute_name || 'SKYLINE INSTITUTE';
  const shortBrand = brand.split(' ').slice(0,2).join(' ').toUpperCase();

  // ---------- white background with thin border ----------
  doc.setFillColor('#FFFFFF');
  doc.rect(0, 0, W, H, 'F');
  doc.setDrawColor('#D1D5DB'); doc.setLineWidth(0.3);
  doc.rect(0.5, 0.5, W - 1, H - 1, 'S');

  // ---------- Logo (1:1) top‑left ----------
  const logoSize = ch * 0.22;           // square, proportional to card height
  const logoX = mx, logoY = my;
  const logoBase64 = settings?.site_logo_base64;
  if (logoBase64) {
    addImageSafe(doc, logoBase64, logoX, logoY, logoSize, logoSize);
  }

  // ---------- Institute title (right of logo) ----------
  const titleX = logoBase64 ? logoX + logoSize + 2.5 : logoX;
  doc.setFontSize(ch * 0.17); doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
  doc.text(shortBrand, titleX, logoY + logoSize * 0.45);
  doc.setFontSize(ch * 0.07); doc.setTextColor('#F59E0B');
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', titleX, logoY + logoSize * 0.7);
  // divider line
  doc.setDrawColor('#CBD5E1'); doc.setLineWidth(0.2);
  doc.line(titleX, logoY + logoSize * 0.82, mx + cw * 0.92, logoY + logoSize * 0.82);

  // ---------- Student Badge ----------
  const badgeY = logoY + logoSize + ch * 0.06;
  doc.setFillColor('#10B981'); doc.rect(mx, badgeY, cw * 0.2, ch * 0.07, 'F');
  doc.setFontSize(ch * 0.07); doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'bold');
  doc.text('STUDENT ID', mx + cw * 0.1, badgeY + ch * 0.045, { align: 'center' });

  // ---------- Student name ----------
  const nameY = badgeY + ch * 0.14;
  doc.setFontSize(ch * 0.18); doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
  doc.text(student.name.toUpperCase(), mx, nameY);

  // ---------- Details ----------
  const detY = nameY + ch * 0.13;
  const lh = ch * 0.09;   // line height
  const leftX = mx + cw * 0.27;
  const labX = mx;
  doc.setFontSize(ch * 0.09); doc.setTextColor('#64748B'); doc.setFont('helvetica', 'normal');
  doc.text('Roll No:', labX, detY);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold'); doc.text(student.roll_number, leftX, detY);
  doc.setTextColor('#64748B'); doc.setFont('helvetica', 'normal');
  doc.text('Course:', labX, detY + lh);
  doc.setTextColor('#F59E0B'); doc.setFont('helvetica', 'bold');
  const shortCourse = student.course_name.length > 26 ? student.course_name.substring(0,25)+'...' : student.course_name;
  doc.text(shortCourse, leftX, detY + lh);
  doc.setTextColor('#64748B'); doc.setFont('helvetica', 'normal');
  doc.text('Phone:', labX, detY + 2*lh);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold'); doc.text(student.phone, leftX, detY + 2*lh);
  doc.setTextColor('#64748B'); doc.setFont('helvetica', 'normal');
  doc.text('Valid Till:', labX, detY + 3*lh);
  doc.setTextColor('#DC2626'); doc.setFont('helvetica', 'bold'); doc.text(student.valid_till, leftX, detY + 3*lh);

  // ---------- Student Photo (3:4) top‑right ----------
  const phW = cw * 0.18;
  const phH = phW * (4/3);
  const phX = W - mx - phW;
  const phY = badgeY - ch * 0.03;
  doc.setDrawColor('#D1D5DB'); doc.setLineWidth(0.4);
  doc.rect(phX, phY, phW, phH, 'S');
  if (student.photo_base64) {
    addImageSafe(doc, student.photo_base64, phX + 0.8, phY + 0.8, phW - 1.6, phH - 1.6, 'JPEG');
  } else {
    doc.setFillColor('#F3F4F6'); doc.rect(phX + 0.8, phY + 0.8, phW - 1.6, phH - 1.6, 'F');
    doc.setFontSize(ch * 0.06); doc.setTextColor('#9CA3AF'); doc.text('PHOTO', phX + phW/2, phY + phH/2, { align: 'center' });
  }

  // ---------- Signature (16:9) bottom right area ----------
  const sigW = cw * 0.32;
  const sigH = sigW * (9/16);
  const sigX = mx + cw * 0.38;
  const sigY = H - my - sigH - ch * 0.05;
  const sigBase64 = settings?.hod_signature_base64;
  if (sigBase64) {
    addImageSafe(doc, sigBase64, sigX, sigY, sigW, sigH);
  } else {
    drawDirectorSignature(doc, sigX, sigY + sigH/2);
  }
  doc.setFontSize(ch * 0.06); doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'italic');
  doc.text('Authorized Signatory', sigX + sigW/2, sigY + sigH + ch * 0.04, { align: 'center' });

  // ---------- Seal (1:1) bottom left ----------
  const sealSize = ch * 0.24;
  const sealX = mx;
  const sealY = H - my - sealSize;
  const sealBase64 = settings?.office_seal_base64;
  if (sealBase64) {
    addImageSafe(doc, sealBase64, sealX, sealY, sealSize, sealSize);
  } else {
    drawOfficialSeal(doc, sealX + sealSize/2, sealY + sealSize/2, sealSize/2, false);
  }
  doc.setFontSize(ch * 0.06); doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SEAL', sealX + sealSize/2, sealY + sealSize + ch * 0.04, { align: 'center' });

  doc.save(`Student_ID_${student.roll_number}.pdf`);
}