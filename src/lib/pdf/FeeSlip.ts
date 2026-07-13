import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { drawOfficialSeal, drawDirectorSignature, addImageSafe } from './common';

export function downloadFeeSlipPdf(student: Student, settings?: SiteSettings | null): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210, pageH = 297;
  const margin = 15, contentW = pageW - 2*margin;
  let y = margin + 5;
  const brand = settings?.institute_name || 'SKYLINE INSTITUTE';

  // light watermark
  doc.saveGraphicsState();
  doc.setFontSize(50); doc.setTextColor(230,230,230); doc.setFont('helvetica','bold');
  doc.text(brand.toUpperCase(), pageW/2, pageH/2, { align:'center', angle: -30 });
  doc.restoreGraphicsState();

  // outer border
  doc.setDrawColor('#0F172A'); doc.setLineWidth(0.8); doc.rect(margin, margin, contentW, pageH - 2*margin);

  // letterhead: logo + institute name
  const logoBase = settings?.site_logo_base64;
  if (logoBase) addImageSafe(doc, logoBase, margin+5, y, 18, 18);
  const logoX = logoBase ? margin+28 : margin+5;
  doc.setFontSize(18); doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold');
  doc.text(brand.toUpperCase(), logoX, y+8);
  doc.setFontSize(8); doc.setTextColor('#F59E0B');
  doc.text('MANAGEMENT, HOSPITALITY & BARTENDING ACADEMY', logoX, y+13);
  doc.setFontSize(6); doc.setTextColor('#64748B');
  doc.text(`Contact: ${settings?.contact_email || 'admissions@skylineinstitute.in'} | Phone: ${settings?.contact_phone_1 || ''}`, logoX, y+17);

  // receipt info right side
  doc.setFontSize(8); doc.setTextColor('#0F172A');
  doc.text('OFFICIAL FEE RECEIPT', margin + contentW - 5, y+8, { align:'right' });
  doc.setFontSize(7); doc.setTextColor('#64748B');
  doc.text(`Receipt No: REC-${student.id.replace('student-','').toUpperCase()}`, margin + contentW - 5, y+13, { align:'right' });
  doc.text(`Date: ${student.reg_date}`, margin + contentW - 5, y+16, { align:'right' });

  y += 25;
  doc.setDrawColor('#D1D5DB'); doc.setLineWidth(0.3); doc.line(margin+5, y, margin + contentW -5, y);
  y += 8;

  // student info block
  doc.setFillColor('#F8FAFC'); doc.rect(margin+5, y, contentW-10, 22, 'F');
  doc.setDrawColor('#E2E8F0'); doc.rect(margin+5, y, contentW-10, 22, 'S');
  doc.setFontSize(9); doc.setTextColor('#0F172A'); doc.setFont('helvetica','bold');
  doc.text('Student Information', margin+8, y+5);
  doc.setFontSize(8); doc.setTextColor('#475569'); doc.setFont('helvetica','normal');
  doc.text(`Name: ${student.name}`, margin+8, y+11);
  doc.text(`Roll No: ${student.roll_number}`, margin+8, y+16);
  doc.text(`Course: ${student.course_name}`, margin+8, y+21);
  doc.text(`Email: ${student.email}`, margin+95, y+11);
  doc.text(`Phone: ${student.phone}`, margin+95, y+16);
  doc.text(`Valid Till: ${student.valid_till}`, margin+95, y+21);
  y += 28;

  // fee table
  doc.setFillColor('#1E293B'); doc.rect(margin+5, y, contentW-10, 8, 'F');
  doc.setFontSize(8); doc.setTextColor('#FFFFFF'); doc.setFont('helvetica','bold');
  doc.text('Particulars', margin+8, y+5.5);
  doc.text('Amount (INR)', margin + contentW -30, y+5.5, { align:'right' });
  y += 8;
  const tableRows = [
    { desc:'Tuition Fee', amount: student.fee_amount },
    { desc:'Admission Fee', amount:0 },
    { desc:'Lab / Material Charges', amount:0 },
    { desc:'Total Gross Fee', amount: student.fee_amount, isBold:true },
  ];
  tableRows.forEach((row,i) => {
    if (i%2===0) { doc.setFillColor('#F1F5F9'); doc.rect(margin+5, y, contentW-10, 7, 'F'); }
    if (row.isBold) doc.setFont('helvetica','bold'); else doc.setFont('helvetica','normal');
    doc.setFontSize(8); doc.setTextColor('#1E293B');
    doc.text(row.desc, margin+8, y+4.5);
    doc.text(`₹ ${row.amount.toLocaleString('en-IN')}`, margin + contentW -30, y+4.5, { align:'right' });
    y += 7;
  });
  y += 3;

  // payments received
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor('#0F172A');
  doc.text('Payments Received', margin+8, y); y += 6;
  const ledger = student.fee_ledgers || [];
  if (ledger.length > 0) {
    ledger.forEach(entry => {
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor('#475569');
      doc.text(`${entry.date} - ${entry.payment_mode.toUpperCase()} (Collected by: ${entry.collected_by})`, margin+12, y);
      doc.text(`₹ ${entry.amount.toLocaleString('en-IN')}`, margin + contentW -30, y, { align:'right' });
      y += 5;
    });
  }
  const totalPaid = student.fee_paid, balance = student.fee_amount - totalPaid, isPaid = balance <= 0;
  doc.setDrawColor('#CBD5E1'); doc.line(margin+5, y, margin + contentW -5, y); y += 6;
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor('#0F172A'); doc.text('Summary', margin+8, y); y += 7;
  doc.setFontSize(8); doc.setTextColor('#475569'); doc.setFont('helvetica','normal');
  doc.text('Total Gross Fee:', margin+8, y); doc.text(`₹ ${student.fee_amount.toLocaleString('en-IN')}`, margin + contentW -30, y, { align:'right' }); y += 6;
  doc.text('Total Paid:', margin+8, y); doc.setTextColor('#16A34A'); doc.text(`₹ ${totalPaid.toLocaleString('en-IN')}`, margin + contentW -30, y, { align:'right' }); y += 6;
  doc.setTextColor(isPaid ? '#16A34A' : '#DC2626'); doc.setFont('helvetica','bold');
  doc.text('Balance Due:', margin+8, y); doc.text(`₹ ${balance.toLocaleString('en-IN')}`, margin + contentW -30, y, { align:'right' });
  if (isPaid) { doc.saveGraphicsState(); doc.setFontSize(22); doc.setTextColor('#16A34A'); doc.setFont('helvetica','bold'); doc.text('PAID', margin + contentW -50, y+12, { angle: -20 }); doc.restoreGraphicsState(); }
  y += 15;

  // seal & signature
  doc.setDrawColor('#D1D5DB'); doc.line(margin+5, y, margin + contentW -5, y); y += 8;
  const sealB64 = settings?.office_seal_base64, sigB64 = settings?.hod_signature_base64;
  if (sealB64) addImageSafe(doc, sealB64, margin+20, y, 28, 28);
  else drawOfficialSeal(doc, margin+35, y+14, 14, true);
  doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor('#64748B');
  doc.text('OFFICIAL COLLEGE SEAL', margin+35, y+30, { align:'center' });
  if (sigB64) addImageSafe(doc, sigB64, margin + contentW -80, y+5, 32, 18);
  else drawDirectorSignature(doc, margin + contentW -80, y+15);
  doc.setDrawColor('#94A3B8'); doc.line(margin + contentW -85, y+25, margin + contentW -10, y+25);
  doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor('#64748B');
  doc.text('AUTHORIZED SIGNATORY', margin + contentW -50, y+30, { align:'center' });

  y = pageH - 15;
  doc.setFontSize(6); doc.setTextColor('#94A3B8');
  doc.text('This is a computer generated receipt and does not require a physical signature.', pageW/2, y, { align:'center' });

  doc.save(`FeeSlip_${student.roll_number}.pdf`);
}