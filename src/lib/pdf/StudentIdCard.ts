import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadStudentIdPdf(student: Student, settings?: SiteSettings | null): void {
  const W = 120, H = 75;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });
  const brand = settings?.institute_name || 'SKYLINE INSTITUTE';
  const shortBrand = brand.split(' ').slice(0, 2).join(' ').toUpperCase();

  // White background
  doc.setFillColor('#FFFFFF'); doc.rect(0, 0, W, H, 'F');
  // Subtle border
  doc.setDrawColor('#E5E7EB'); doc.setLineWidth(0.3); doc.rect(1, 1, W - 2, H - 2, 'S');

  const mx = 6, my = 5, cw = W - 2 * mx, ch = H - 2 * my;

  // Logo (1:1) top-left
  const logoSize = ch * 0.2;
  const logoBase = settings?.site_logo_base64;
  if (logoBase) addImageSafe(doc, logoBase, mx, my, logoSize, logoSize);

  // Institute name
  const titleX = logoBase ? mx + logoSize + 2 : mx;
  doc.setFontSize(ch * 0.16); doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
  doc.text(shortBrand, titleX, my + logoSize * 0.4);
  doc.setFontSize(ch * 0.06); doc.setTextColor('#F59E0B');
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING', titleX, my + logoSize * 0.7);

  // Divider
  doc.setDrawColor('#E5E7EB'); doc.line(titleX, my + logoSize * 0.85, mx + cw * 0.95, my + logoSize * 0.85);

  // Student badge
  const badgeY = my + logoSize + ch * 0.05;
  doc.setFillColor('#10B981'); doc.rect(mx, badgeY, cw * 0.18, ch * 0.06, 'F');
  doc.setFontSize(ch * 0.06); doc.setTextColor('#FFFFFF'); doc.text('STUDENT ID', mx + cw * 0.09, badgeY + ch * 0.04, { align: 'center' });

  // Student name
  const nameY = badgeY + ch * 0.13;
  doc.setFontSize(ch * 0.17); doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
  doc.text(student.name.toUpperCase(), mx, nameY);

  // Details
  const detY = nameY + ch * 0.12;
  const lh = ch * 0.09;
  const leftX = mx + cw * 0.28;
  doc.setFontSize(ch * 0.09); doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text('Roll No:', mx, detY);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold'); doc.text(student.roll_number, leftX, detY);
  doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text('Course:', mx, detY + lh);
  doc.setTextColor('#F59E0B'); doc.setFont('helvetica', 'bold');
  const shortCourse = student.course_name.length > 24 ? student.course_name.substring(0, 23) + '...' : student.course_name;
  doc.text(shortCourse, leftX, detY + lh);
  doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text('Phone:', mx, detY + 2 * lh);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold'); doc.text(student.phone, leftX, detY + 2 * lh);
  doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text('Valid Till:', mx, detY + 3 * lh);
  doc.setTextColor('#DC2626'); doc.setFont('helvetica', 'bold'); doc.text(student.valid_till, leftX, detY + 3 * lh);

  // Student photo (3:4) top-right
  const phW = cw * 0.18, phH = phW * 4 / 3;
  const phX = W - mx - phW, phY = badgeY - ch * 0.02;
  doc.setDrawColor('#E5E7EB'); doc.setLineWidth(0.3); doc.rect(phX, phY, phW, phH, 'S');
  if (student.photo_base64) addImageSafe(doc, student.photo_base64, phX + 0.5, phY + 0.5, phW - 1, phH - 1, 'JPEG');

  // Signature (16:9) bottom center
  const sigW = cw * 0.3, sigH = sigW * 9 / 16;
  const sigX = mx + cw * 0.36, sigY = H - my - sigH - ch * 0.04;
  const sigBase = settings?.hod_signature_base64;
  if (sigBase) addImageSafe(doc, sigBase, sigX, sigY, sigW, sigH);
  else drawDirectorSignature(doc, sigX, sigY + sigH / 2);
  doc.setFontSize(ch * 0.05); doc.setTextColor('#9CA3AF'); doc.setFont('helvetica', 'italic');
  doc.text('Authorized Signatory', sigX + sigW / 2, sigY + sigH + ch * 0.03, { align: 'center' });

  // Seal (1:1) bottom left
  const sealSize = ch * 0.22;
  const sealBase = settings?.office_seal_base64;
  if (sealBase) addImageSafe(doc, sealBase, mx, H - my - sealSize, sealSize, sealSize);
  else drawOfficialSeal(doc, mx + sealSize / 2, H - my - sealSize / 2, sealSize / 2, false);
  doc.setFontSize(ch * 0.05); doc.setTextColor('#9CA3AF'); doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SEAL', mx + sealSize / 2, H - my + ch * 0.03, { align: 'center' });

  doc.save(`Student_ID_${student.roll_number}.pdf`);
}