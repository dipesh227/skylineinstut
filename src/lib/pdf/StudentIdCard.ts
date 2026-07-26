import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { addImageSafe } from './common';

export function downloadStudentIdPdf(student: Student, settings?: SiteSettings | null): void {
  // Card dimensions – exactly the card, no extra margins
  const cardW = 70;
  const cardH = 115;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [cardW, cardH] });

  const instituteName = (settings?.institute_name || 'SKYLINE INSTITUTE').toUpperCase();
  const addressVal   = settings?.contact_address || 'Khatima, Uttarakhand';
  const emailVal     = settings?.contact_email || 'admissions@skylineinstitute.in';
  const phoneVal     = student.phone || settings?.contact_phone_1 || '+91 6395427119';
  const courseVal    = student.course_name || 'BARTENDING & MIXOLOGY';
  const rollVal      = student.roll_number || 'SL-2025-1047';

  const radius = 4;

  // ---------- CARD BACKGROUND ----------
  doc.setFillColor('#FFFFFF');
  doc.setDrawColor('#CBD5E1');
  doc.setLineWidth(0.3);
  doc.roundedRect(0, 0, cardW, cardH, radius, radius, 'FD');

  // ---------- TOP NAVY WAVE ----------
  doc.setFillColor('#061838');
  doc.roundedRect(0, 0, cardW, 16, radius, radius, 'F');
  doc.rect(0, 12, cardW, 4, 'F');

  // White wave cuts
  doc.setFillColor('#FFFFFF');
  doc.triangle(0, 16, 18, 16, 0, 12, 'F');
  doc.triangle(cardW, 16, cardW - 18, 16, cardW, 12, 'F');

  // ---------- INSTITUTE LOGO (top left of the navy area) ----------
  const logoUrl = settings?.logo_url || settings?.site_logo_base64;
  if (logoUrl) {
    addImageSafe(doc, logoUrl, 3, 2, 10, 10);
  }

  // ---------- EMBLEM / PHOTO CIRCLE ----------
  const emblemX = cardW / 2;
  const emblemY = 20;
  const emblemRadius = 12;

  // White ring
  doc.setFillColor('#FFFFFF');
  doc.setDrawColor('#E2E8F0');
  doc.setLineWidth(0.8);
  doc.circle(emblemX, emblemY, emblemRadius + 0.8, 'FD');

  // Student photo
  const photoData = student.photo_url || student.photo_base64;
  if (photoData) {
    try {
      addImageSafe(doc, photoData, emblemX - emblemRadius, emblemY - emblemRadius, emblemRadius * 2, emblemRadius * 2);
    } catch (e) {
      drawEmblemFallback(doc, emblemX, emblemY, emblemRadius);
    }
  } else {
    drawEmblemFallback(doc, emblemX, emblemY, emblemRadius);
  }

  // ---------- BRANDING HEADER ----------
  let currentY = emblemY + emblemRadius + 7;
  doc.setTextColor('#061838');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SKYLINE', emblemX, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setTextColor('#D97706');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('INSTITUTE OF MANAGEMENT', emblemX, currentY, { align: 'center' });

  currentY += 3.5;
  doc.setFontSize(5.8);
  doc.text('HOSPITALITY  AND  BARTENDING', emblemX, currentY, { align: 'center' });

  // ---------- STUDENT NAME ----------
  currentY += 7;
  doc.setTextColor('#061838');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const rawName = student.name || '';
  const displayName = rawName.toLowerCase().startsWith('mr') || 
                      rawName.toLowerCase().startsWith('miss') || 
                      rawName.toLowerCase().startsWith('mrs') ? rawName : `Mr. ${rawName}`;
  doc.text(displayName, emblemX, currentY, { align: 'center' });

  currentY += 4.2;
  doc.setTextColor('#D97706');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('STUDENT', emblemX, currentY, { align: 'center' });

  // ---------- DETAILS WITH NAVY ICONS ----------
  currentY += 7;

  const items = [
    { label: 'Address', val: addressVal },
    { label: 'Gmail',   val: emailVal },
    { label: 'Contact', val: phoneVal },
    { label: 'Course',  val: courseVal, isHighlight: true },
    { label: 'Roll No', val: rollVal }
  ];

  const iconX   = 6;
  const labelX  = 13;
  const colonX  = 27;
  const valX    = 29;
  const rowSpacing = 5.2;

  items.forEach(item => {
    // Navy circle icon
    doc.setFillColor('#061838');
    doc.circle(iconX, currentY - 1, 2, 'F');
    doc.setFillColor('#FFFFFF');
    doc.circle(iconX, currentY - 1, 0.8, 'F');

    // Label
    doc.setTextColor('#0F172A');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(item.label, labelX, currentY);
    doc.text(':', colonX, currentY);

    // Value
    doc.setTextColor(item.isHighlight ? '#D97706' : '#1E293B');
    doc.setFont('helvetica', item.isHighlight ? 'bold' : 'normal');
    doc.setFontSize(6.5);
    const lines = doc.splitTextToSize(item.val, cardW - 32);
    doc.text(lines[0], valX, currentY);

    currentY += rowSpacing;
  });

  // ---------- BOTTOM AREA: SIGNATURE & SEAL ----------
  const footerY = cardH - 10;

  // Bottom navy wave
  doc.setFillColor('#061838');
  doc.roundedRect(0, footerY, cardW, 10, radius, radius, 'F');
  doc.rect(0, footerY, cardW, 4, 'F');
  doc.setFillColor('#FFFFFF');
  doc.triangle(0, footerY, 18, footerY, 0, footerY + 3, 'F');
  doc.triangle(cardW, footerY, cardW - 18, footerY, cardW, footerY + 3, 'F');

  // HOD Signature (right side, just above the navy footer)
  const sigY = footerY - 8;
  const sigSrc = settings?.hod_signature_url || settings?.hod_signature_base64;
  if (sigSrc) {
    addImageSafe(doc, sigSrc, cardW - 28, sigY, 24, 10);
  } else {
    // Simple line placeholder
    doc.setDrawColor('#94A3B8');
    doc.setLineWidth(0.4);
    doc.line(cardW - 28, sigY + 5, cardW - 4, sigY + 5);
  }

  // Office Seal (left side, just above the navy footer)
  const sealSrc = settings?.office_seal_url || settings?.office_seal_base64;
  if (sealSrc) {
    addImageSafe(doc, sealSrc, 4, sigY, 14, 14);
  } else {
    // Circle placeholder
    doc.setDrawColor('#061838');
    doc.setLineWidth(0.8);
    doc.circle(11, sigY + 7, 7, 'S');
    doc.setFontSize(4);
    doc.setTextColor('#061838');
    doc.text('SEAL', 11, sigY + 7.5, { align: 'center' });
  }

  // Save
  doc.save(`Skyline_Student_ID_${student.roll_number || 'Card'}.pdf`);
}

// Fallback emblem if no student photo
function drawEmblemFallback(doc: jsPDF, cx: number, cy: number, r: number) {
  doc.setDrawColor('#061838');
  doc.setLineWidth(1.2);
  doc.circle(cx, cy, r, 'S');
  doc.setDrawColor('#D97706');
  doc.setLineWidth(1.0);
  doc.line(cx - 10, cy + 4, cx + 10, cy + 4);
  doc.setFillColor('#2563EB');
  doc.rect(cx - 5, cy - 4, 2.5, 7, 'F');
  doc.setFillColor('#061838');
  doc.rect(cx - 1.5, cy - 7, 3, 10, 'F');
  doc.setFillColor('#D97706');
  doc.rect(cx + 2, cy - 5, 2.5, 8, 'F');
  doc.setFillColor('#061838');
  doc.triangle(cx, cy + 4, cx - 6, cy + 6, cx + 6, cy + 6, 'F');
  doc.setFillColor('#D97706');
  doc.rect(cx - 3, cy + 6, 6, 1.5, 'F');
}