import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadFeeSlipPdf(student: Student, settings?: SiteSettings | null): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210, pageH = 297, margin = 15, contentW = pageW - 2 * margin;
  let y = margin + 5;
  const brand = settings?.institute_name || 'SKYLINE INSTITUTE';

  // Light watermark
  doc.saveGraphicsState();
  doc.setFontSize(45); doc.setTextColor(240, 240, 240); doc.setFont('helvetica', 'bold');
  doc.text(brand.toUpperCase(), pageW / 2, pageH / 2, { align: 'center', angle: -25 });
  doc.restoreGraphicsState();

  // Outer border
  doc.setDrawColor('#D1D5DB'); doc.setLineWidth(0.5); doc.rect(margin, margin, contentW, pageH - 2 * margin);

  // Letterhead
  const logoBase = settings?.site_logo_base64;
  if (logoBase) addImageSafe(doc, logoBase, margin + 5, y, 16, 16);
  const logoX = logoBase ? margin + 25 : margin + 5;
  doc.setFontSize(16); doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
  doc.text(brand.toUpperCase(), logoX, y + 7);
  doc.setFontSize(7); doc.setTextColor('#F59E0B');
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', logoX, y + 11);
  doc.setFontSize(6); doc.setTextColor('#6B7280');
  doc.text(`Contact: ${settings?.contact_email || 'admissions@skylineinstitute.in'} | Phone: ${settings?.contact_phone_1 || ''}`, logoX, y + 14);

  // Receipt info right
  doc.setFontSize(8); doc.setTextColor('#0F172A');
  doc.text('OFFICIAL FEE RECEIPT', margin + contentW - 5, y + 7, { align: 'right' });
  doc.setFontSize(7); doc.setTextColor('#6B7280');
  doc.text(`Receipt No: REC-${student.id.replace('student-', '').toUpperCase()}`, margin + contentW - 5, y + 11, { align: 'right' });
  doc.text(`Date: ${student.reg_date}`, margin + contentW - 5, y + 14, { align: 'right' });

  y += 22;
  doc.setDrawColor('#E5E7EB'); doc.line(margin + 5, y, margin + contentW - 5, y); y += 8;

  // Student info block
  doc.setFillColor('#F9FAFB'); doc.rect(margin + 5, y, contentW - 10, 20, 'F');
  doc.setDrawColor('#E5E7EB'); doc.rect(margin + 5, y, contentW - 10, 20, 'S');
  doc.setFontSize(9); doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold');
  doc.text('Student Information', margin + 8, y + 5);
  doc.setFontSize(8); doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${student.name}`, margin + 8, y + 10);
  doc.text(`Roll No: ${student.roll_number}`, margin + 8, y + 15);
  doc.text(`Course: ${student.course_name}`, margin + 95, y + 10);
  doc.text(`Phone: ${student.phone}`, margin + 95, y + 15);
  y += 25;

  // Fee table
  doc.setFillColor('#1E293B'); doc.rect(margin + 5, y, contentW - 10, 8, 'F');
  doc.setFontSize(8); doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'bold');
  doc.text('Particulars', margin + 8, y + 5.5);
  doc.text('Amount (INR)', margin + contentW - 30, y + 5.5, { align: 'right' });
  y += 8;

  const rows = [
    { desc: 'Tuition Fee', amount: student.fee_amount },
    { desc: 'Total Gross Fee', amount: student.fee_amount, bold: true },
  ];
  rows.forEach((row, i) => {
    if (i % 2 === 0) { doc.setFillColor('#F9FAFB'); doc.rect(margin + 5, y, contentW - 10, 7, 'F'); }
    doc.setFont(row.bold ? 'helvetica' : 'helvetica', row.bold ? 'bold' : 'normal');
    doc.setFontSize(8); doc.setTextColor('#0F172A');
    doc.text(row.desc, margin + 8, y + 4.5);
    doc.text(`₹ ${row.amount.toLocaleString('en-IN')}`, margin + contentW - 30, y + 4.5, { align: 'right' });
    y += 7;
  });

  y += 3;
  // Payments received
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor('#0F172A');
  doc.text('Payments Received', margin + 8, y); y += 6;
  const ledger = student.fee_ledgers || [];
  if (ledger.length > 0) {
    ledger.forEach(entry => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor('#6B7280');
      doc.text(`${entry.date} - ${entry.payment_mode.toUpperCase()} (By: ${entry.collected_by})`, margin + 12, y);
      doc.text(`₹ ${entry.amount.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' });
      y += 5;
    });
  }

  const totalPaid = student.fee_paid, balance = student.fee_amount - totalPaid, isPaid = balance <= 0;
  doc.setDrawColor('#E5E7EB'); doc.line(margin + 5, y, margin + contentW - 5, y); y += 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor('#0F172A'); doc.text('Summary', margin + 8, y); y += 7;
  doc.setFontSize(8); doc.setTextColor('#6B7280'); doc.setFont('helvetica', 'normal');
  doc.text('Total Gross Fee:', margin + 8, y); doc.text(`₹ ${student.fee_amount.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' }); y += 6;
  doc.text('Total Paid:', margin + 8, y); doc.setTextColor('#16A34A'); doc.text(`₹ ${totalPaid.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' }); y += 6;
  doc.setTextColor(isPaid ? '#16A34A' : '#DC2626'); doc.setFont('helvetica', 'bold');
  doc.text('Balance Due:', margin + 8, y); doc.text(`₹ ${balance.toLocaleString('en-IN')}`, margin + contentW - 30, y, { align: 'right' });
  if (isPaid) { doc.saveGraphicsState(); doc.setFontSize(20); doc.setTextColor('#16A34A'); doc.setFont('helvetica', 'bold'); doc.text('PAID', margin + contentW - 50, y + 10, { angle: -20 }); doc.restoreGraphicsState(); }
  y += 15;

  // Seal & Signature
  doc.setDrawColor('#E5E7EB'); doc.line(margin + 5, y, margin + contentW - 5, y); y += 8;
  const sealB64 = settings?.office_seal_base64, sigB64 = settings?.hod_signature_base64;
  if (sealB64) addImageSafe(doc, sealB64, margin + 20, y, 24, 24);
  else drawOfficialSeal(doc, margin + 32, y + 12, 12, true);
  doc.setFontSize(7); doc.setTextColor('#9CA3AF'); doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SEAL', margin + 32, y + 26, { align: 'center' });

  if (sigB64) addImageSafe(doc, sigB64, margin + contentW - 80, y + 4, 32, 18);
  else drawDirectorSignature(doc, margin + contentW - 80, y + 14);
  doc.setDrawColor('#9CA3AF'); doc.line(margin + contentW - 85, y + 24, margin + contentW - 10, y + 24);
  doc.setFontSize(7); doc.setTextColor('#9CA3AF'); doc.text('AUTHORIZED SIGNATORY', margin + contentW - 50, y + 29, { align: 'center' });

  y = pageH - 12;
  doc.setFontSize(6); doc.setTextColor('#9CA3AF');
  doc.text('This is a computer generated receipt.', pageW / 2, y, { align: 'center' });

  doc.save(`FeeSlip_${student.roll_number}.pdf`);
}