import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadFeeSlipPdf(student: Student, settings?: SiteSettings | null): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - 2 * margin;
  let y = margin + 4;

  const instituteName = (settings?.institute_name || 'SKYLINE INSTITUTE').toUpperCase();
  const gold = '#B8860B';

  // ---------- LIGHT WATERMARK ----------
  doc.saveGraphicsState();
  doc.setFontSize(45);
  doc.setTextColor(235, 235, 235);
  doc.setFont('helvetica', 'bold');
  doc.text(instituteName, pageW / 2, pageH / 2, { align: 'center', angle: -20 });
  doc.restoreGraphicsState();

  // ---------- OUTER BORDER ----------
  doc.setDrawColor(gold);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, contentW, pageH - 2 * margin, 'S');
  doc.setLineWidth(0.3);
  doc.rect(margin + 2, margin + 2, contentW - 4, pageH - 2 * (margin + 2), 'S');

  // ---------- LETTERHEAD: LOGO + INSTITUTE NAME ----------
  const logoUrl = settings?.logo_url || settings?.site_logo_base64;
  if (logoUrl) {
    addImageSafe(doc, logoUrl, margin + 4, y, 16, 16);
  }
  const logoX = logoUrl ? margin + 24 : margin + 4;

  doc.setFontSize(16);
  doc.setTextColor('#0F172A');
  doc.setFont('helvetica', 'bold');
  doc.text(instituteName, logoX, y + 6);

  doc.setFontSize(7);
  doc.setTextColor(gold);
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', logoX, y + 10);

  doc.setFontSize(5.5);
  doc.setTextColor('#64748B');
  doc.text(`Contact: ${settings?.contact_email || 'admissions@skylineinstitute.in'} | Phone: ${settings?.contact_phone_1 || ''}`, logoX, y + 13);

  // ---------- RECEIPT HEADER (right side) ----------
  doc.setFontSize(10);
  doc.setTextColor('#0F172A');
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL FEE RECEIPT', margin + contentW - 4, y + 4, { align: 'right' });
  doc.setFontSize(7);
  doc.setTextColor('#64748B');
  doc.text(`Receipt No: REC-${student.id.replace('student-', '').toUpperCase()}`, margin + contentW - 4, y + 8, { align: 'right' });
  doc.text(`Date: ${student.reg_date || ''}`, margin + contentW - 4, y + 11, { align: 'right' });

  y += 20;
  doc.setDrawColor('#CBD5E1');
  doc.setLineWidth(0.3);
  doc.line(margin + 4, y, margin + contentW - 4, y);
  y += 8;

  // ---------- STUDENT INFORMATION BOX ----------
  doc.setFillColor('#F9FAFB');
  doc.rect(margin + 4, y, contentW - 8, 18, 'F');
  doc.setDrawColor('#E5E7EB');
  doc.rect(margin + 4, y, contentW - 8, 18, 'S');

  doc.setFontSize(9);
  doc.setTextColor('#0F172A');
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', margin + 8, y + 5);

  doc.setFontSize(7.5);
  doc.setTextColor('#475569');
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${student.name}`, margin + 8, y + 10);
  doc.text(`Roll No: ${student.roll_number}`, margin + 8, y + 14);
  doc.text(`Course: ${student.course_name}`, margin + 100, y + 10);
  doc.text(`Phone: ${student.phone}`, margin + 100, y + 14);
  y += 22;

  // ---------- FEE TABLE HEADER ----------
  doc.setFillColor('#1E293B');
  doc.rect(margin + 4, y, contentW - 8, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.text('Particulars', margin + 8, y + 5.5);
  doc.text('Amount (INR)', margin + contentW - 30, y + 5.5, { align: 'right' });
  y += 8;

  // ---------- FEE ROWS ----------
  const rows = [
    { desc: 'Tuition Fee', amount: student.fee_amount },
    { desc: 'Total Gross Fee', amount: student.fee_amount, bold: true },
  ];
  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor('#F9FAFB');
      doc.rect(margin + 4, y, contentW - 8, 7, 'F');
    }
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#0F172A');
    doc.text(row.desc, margin + 8, y + 4.5);
    doc.text(`₹ ${row.amount.toLocaleString('en-IN')}`, margin + contentW - 30, y + 4.5, { align: 'right' });
    y += 7;
  });
  y += 2;

  // ---------- PAYMENTS RECEIVED ----------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#0F172A');
  doc.text('Payments Received', margin + 8, y);
  y += 5;

  const ledger = student.fee_ledgers || [];
  if (ledger.length > 0) {
    ledger.forEach(entry => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor('#475569');
      doc.text(`${entry.date} - ${entry.payment_mode.toUpperCase()} (By: ${entry.collected_by})`, margin + 12, y);
      doc.text(`₹ ${entry.amount.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' });
      y += 5;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor('#9CA3AF');
    doc.text('No individual payment records found.', margin + 12, y);
    y += 5;
  }

  // ---------- SUMMARY ----------
  const totalPaid = student.fee_paid;
  const balance = student.fee_amount - totalPaid;
  const isPaid = balance <= 0;

  doc.setDrawColor('#CBD5E1');
  doc.setLineWidth(0.3);
  doc.line(margin + 4, y, margin + contentW - 4, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#0F172A');
  doc.text('Summary', margin + 8, y);
  y += 7;

  doc.setFontSize(8);
  doc.setTextColor('#475569');
  doc.setFont('helvetica', 'normal');
  doc.text('Total Gross Fee:', margin + 8, y);
  doc.text(`₹ ${student.fee_amount.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' });
  y += 6;

  doc.text('Total Paid:', margin + 8, y);
  doc.setTextColor('#16A34A');
  doc.text(`₹ ${totalPaid.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' });
  y += 6;

  doc.setTextColor(isPaid ? '#16A34A' : '#DC2626');
  doc.setFont('helvetica', 'bold');
  doc.text('Balance Due:', margin + 8, y);
  doc.text(`₹ ${balance.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' });

  // Paid stamp
  if (isPaid) {
    doc.saveGraphicsState();
    doc.setFontSize(22);
    doc.setTextColor('#16A34A');
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', margin + contentW - 55, y + 14, { angle: -20 });
    doc.restoreGraphicsState();
  }
  y += 15;

  // ---------- SEAL & SIGNATURE ----------
  doc.setDrawColor('#CBD5E1');
  doc.setLineWidth(0.3);
  doc.line(margin + 4, y, margin + contentW - 4, y);
  y += 8;

  const sealB64 = settings?.office_seal_url || settings?.office_seal_base64;
  if (sealB64) {
    addImageSafe(doc, sealB64, margin + 22, y, 24, 24);
  } else {
    drawOfficialSeal(doc, margin + 34, y + 12, 12, true);
  }
  doc.setFontSize(7);
  doc.setTextColor('#64748B');
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SEAL', margin + 34, y + 27, { align: 'center' });

  const sigB64 = settings?.hod_signature_url || settings?.hod_signature_base64;
  if (sigB64) {
    addImageSafe(doc, sigB64, margin + contentW - 80, y + 4, 32, 18);
  } else {
    drawDirectorSignature(doc, margin + contentW - 80, y + 14);
  }
  doc.setDrawColor('#9CA3AF');
  doc.line(margin + contentW - 85, y + 24, margin + contentW - 10, y + 24);
  doc.setFontSize(7);
  doc.setTextColor('#64748B');
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED SIGNATORY', margin + contentW - 50, y + 29, { align: 'center' });

  // ---------- FOOTER ----------
  y = pageH - 12;
  doc.setFontSize(6);
  doc.setTextColor('#9CA3AF');
  doc.text('This is a computer‑generated receipt and does not require a physical signature.', pageW / 2, y, { align: 'center' });

  doc.save(`FeeSlip_${student.roll_number}.pdf`);
}