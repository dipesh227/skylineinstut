import { jsPDF } from 'jspdf';

// Official Seal Vector
export function drawOfficialSeal(doc: jsPDF, centerX: number, centerY: number, radius: number, isFinance: boolean) {
  doc.saveGraphicsState();
  const sealColor = '#1E40AF';
  doc.setDrawColor(sealColor); doc.setTextColor(sealColor);
  doc.setLineWidth(1.0); doc.circle(centerX, centerY, radius, 'S');
  doc.setLineWidth(0.3); doc.circle(centerX, centerY, radius - 1.5, 'S');
  doc.circle(centerX, centerY, radius - 6.5, 'S');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  doc.text('★', centerX - radius + 4, centerY + 1);
  doc.text('★', centerX + radius - 6, centerY + 1);
  doc.setFontSize(5); doc.text('SKYLINE INSTITUTE', centerX, centerY - 8, { align: 'center' });
  doc.setFontSize(4); doc.text('OF MANAGEMENT', centerX, centerY - 5, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5);
  doc.text(isFinance ? 'FINANCE' : 'ACADEMIC', centerX, centerY - 0.5, { align: 'center' });
  doc.text(isFinance ? 'SECTION' : 'PORTAL', centerX, centerY + 2.5, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(4);
  doc.text('* ESTD 2026 *', centerX, centerY + 7, { align: 'center' });
  doc.restoreGraphicsState();
}

// Signature Vector
export function drawDirectorSignature(doc: jsPDF, startX: number, startY: number) {
  doc.saveGraphicsState();
  doc.setDrawColor('#0F172A'); doc.setLineWidth(0.4);
  doc.line(startX, startY, startX + 5, startY - 3);
  doc.line(startX + 5, startY - 3, startX + 8, startY + 2);
  doc.line(startX + 8, startY + 2, startX + 11, startY - 4);
  doc.line(startX + 11, startY - 4, startX + 15, startY - 1);
  doc.line(startX + 15, startY - 1, startX + 18, startY - 5);
  doc.line(startX + 18, startY - 5, startX + 22, startY + 1);
  doc.line(startX + 22, startY + 1, startX + 25, startY - 2);
  doc.line(startX - 2, startY + 3, startX + 28, startY + 1);
  doc.line(startX + 10, startY + 4, startX + 22, startY + 3);
  doc.restoreGraphicsState();
}

// Avatar placeholder
export function drawAvatarPlaceholder(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.saveGraphicsState();
  doc.setFillColor('#1E293B'); doc.rect(x + 0.5, y + 0.5, w - 1, h - 1, 'F');
  doc.setFillColor('#475569'); doc.circle(x + w / 2, y + 12, 4.5, 'F');
  doc.circle(x + w / 2, y + h + 10, 16, 'F');
  doc.setDrawColor('#0F172A'); doc.setLineWidth(1.0); doc.rect(x, y, w, h, 'S');
  doc.restoreGraphicsState();
}

// Helper to safely add an image (base64 or url)
export function addImageSafe(doc: jsPDF, image: string | null | undefined, x: number, y: number, w: number, h: number, format: string = 'PNG') {
  if (image) {
    try { doc.addImage(image, format, x, y, w, h); return true; } catch (e) { console.warn('Image load failed', e); }
  }
  return false;
}