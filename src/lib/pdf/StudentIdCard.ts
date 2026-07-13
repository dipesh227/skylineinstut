import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadStudentIdPdf(student: Student, settings?: SiteSettings | null): void {
  const W = 120, H = 75;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });
  const mx = 6, my = 6, cw = W - 2*mx, ch = H - 2*my;
  const brand = settings?.institute_name || 'SKYLINE INSTITUTE';
  const shortBrand = brand.split(' ').slice(0,2).join(' ').toUpperCase();

  // white background + thin border
  doc.setFillColor('#FFFFFF'); doc.rect(0,0,W,H,'F');
  doc.setDrawColor('#D1D5DB'); doc.setLineWidth(0.3); doc.rect(0.5,0.5,W-1,H-1,'S');

  // logo (1:1) top-left
  const logoSize = ch * 0.22;
  const logoX = mx, logoY = my;
  const logoBase = settings?.site_logo_base64;
  if (logoBase) addImageSafe(doc, logoBase, logoX, logoY, logoSize, logoSize);

  // institute title
  const titleX = logoBase ? logoX + logoSize + 2 : logoX;
  doc.setFontSize(ch*0.17); doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold');
  doc.text(shortBrand, titleX, logoY + logoSize*0.45);
  doc.setFontSize(ch*0.07); doc.setTextColor('#F59E0B');
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', titleX, logoY + logoSize*0.7);
  doc.setDrawColor('#CBD5E1'); doc.setLineWidth(0.2);
  doc.line(titleX, logoY + logoSize*0.82, mx + cw*0.92, logoY + logoSize*0.82);

  // student badge
  const badgeY = logoY + logoSize + ch*0.06;
  doc.setFillColor('#10B981'); doc.rect(mx, badgeY, cw*0.2, ch*0.07, 'F');
  doc.setFontSize(ch*0.07); doc.setTextColor('#FFFFFF'); doc.setFont('helvetica','bold');
  doc.text('STUDENT ID', mx + cw*0.1, badgeY + ch*0.045, { align:'center' });

  // student name
  const nameY = badgeY + ch*0.14;
  doc.setFontSize(ch*0.18); doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold');
  doc.text(student.name.toUpperCase(), mx, nameY);

  // details
  const detY = nameY + ch*0.13;
  const lh = ch*0.09;
  const leftX = mx + cw*0.27;
  doc.setFontSize(ch*0.09); doc.setTextColor('#64748B'); doc.setFont('helvetica','normal');
  doc.text('Roll No:', mx, detY);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold'); doc.text(student.roll_number, leftX, detY);
  doc.setTextColor('#64748B'); doc.setFont('helvetica','normal');
  doc.text('Course:', mx, detY + lh);
  doc.setTextColor('#F59E0B'); doc.setFont('helvetica','bold');
  const shortCourse = student.course_name.length > 26 ? student.course_name.substring(0,25)+'...' : student.course_name;
  doc.text(shortCourse, leftX, detY + lh);
  doc.setTextColor('#64748B'); doc.setFont('helvetica','normal');
  doc.text('Phone:', mx, detY + 2*lh);
  doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold'); doc.text(student.phone, leftX, detY + 2*lh);
  doc.setTextColor('#64748B'); doc.setFont('helvetica','normal');
  doc.text('Valid Till:', mx, detY + 3*lh);
  doc.setTextColor('#DC2626'); doc.setFont('helvetica','bold'); doc.text(student.valid_till, leftX, detY + 3*lh);

  // photo (3:4) top-right
  const phW = cw*0.18, phH = phW*(4/3);
  const phX = W - mx - phW, phY = badgeY - ch*0.03;
  doc.setDrawColor('#D1D5DB'); doc.setLineWidth(0.4); doc.rect(phX, phY, phW, phH, 'S');
  if (student.photo_base64) addImageSafe(doc, student.photo_base64, phX+0.8, phY+0.8, phW-1.6, phH-1.6, 'JPEG');

  // signature (16:9) bottom centre
  const sigW = cw*0.32, sigH = sigW*(9/16);
  const sigX = mx + cw*0.38, sigY = H - my - sigH - ch*0.05;
  if (settings?.hod_signature_base64) addImageSafe(doc, settings.hod_signature_base64, sigX, sigY, sigW, sigH);
  else drawDirectorSignature(doc, sigX, sigY + sigH/2);
  doc.setFontSize(ch*0.06); doc.setTextColor('#6B7280'); doc.setFont('helvetica','italic');
  doc.text('Authorized Signatory', sigX + sigW/2, sigY + sigH + ch*0.04, { align:'center' });

  // seal (1:1) bottom left
  const sealSize = ch*0.24;
  const sealX = mx, sealY = H - my - sealSize;
  if (settings?.office_seal_base64) addImageSafe(doc, settings.office_seal_base64, sealX, sealY, sealSize, sealSize);
  else drawOfficialSeal(doc, sealX + sealSize/2, sealY + sealSize/2, sealSize/2, false);
  doc.setFontSize(ch*0.06); doc.setTextColor('#6B7280'); doc.setFont('helvetica','bold');
  doc.text('OFFICIAL SEAL', sealX + sealSize/2, sealY + sealSize + ch*0.04, { align:'center' });

  doc.save(`Student_ID_${student.roll_number}.pdf`);
}