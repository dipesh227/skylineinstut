import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import { addImageSafe } from './common';

const CARD_W = 70;
const CARD_H = 115;

const COLORS = {
  navy: '#061838',
  navyLight: '#0B2854',
  orange: '#D97706',
  orangeLight: '#F59E0B',
  white: '#FFFFFF',
  text: '#172033',
  muted: '#64748B',
  border: '#CBD5E1',
  light: '#F8FAFC',
  lightOrange: '#FFF7ED',
};

export function downloadStudentIdPdf(
  student: Student,
  settings?: SiteSettings | null
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [CARD_W, CARD_H],
    compress: true,
  });

  const instituteName = String(
    settings?.institute_name || 'SKYLINE INSTITUTE'
  )
    .trim()
    .toUpperCase();

  const address = String(
    settings?.contact_address || 'Khatima, Uttarakhand'
  ).trim();

  const email = String(
    settings?.contact_email || 'admissions@skylineinstitute.in'
  ).trim();

  const phone = String(
    student.phone ||
      settings?.contact_phone_1 ||
      '+91 6395427119'
  ).trim();

  const course = String(
    student.course_name || 'BARTENDING & MIXOLOGY'
  ).trim();

  const rollNumber = String(
    student.roll_number || 'SL-2025-1047'
  ).trim();

  const studentName = formatStudentName(
    String(student.name || 'Student')
  );

  drawBackground(doc);

  drawHeader(
    doc,
    instituteName,
    address,
    settings?.site_logo_base64
  );

  drawIdentitySection(
    doc,
    studentName,
    course,
    rollNumber,
    student.photo_base64
  );

  drawContactSection(
    doc,
    address,
    email,
    phone
  );

  drawAuthorization(
    doc,
    settings
  );

  drawFooter(doc);

  const safeRoll = rollNumber.replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );

  doc.save(
    `Skyline_Student_ID_${safeRoll}.pdf`
  );
}

// ============================================================
// BACKGROUND
// ============================================================

function drawBackground(doc: jsPDF): void {
  doc.setFillColor(COLORS.white);

  doc.rect(
    0,
    0,
    CARD_W,
    CARD_H,
    'F'
  );

  doc.setFillColor('#FCFCFD');

  doc.roundedRect(
    1,
    1,
    CARD_W - 2,
    CARD_H - 2,
    3,
    3,
    'F'
  );

  doc.setDrawColor(COLORS.navy);
  doc.setLineWidth(0.5);

  doc.roundedRect(
    0.8,
    0.8,
    CARD_W - 1.6,
    CARD_H - 1.6,
    3,
    3,
    'S'
  );

  doc.setDrawColor('#E2E8F0');
  doc.setLineWidth(0.2);

  doc.roundedRect(
    2,
    2,
    CARD_W - 4,
    CARD_H - 4,
    2,
    2,
    'S'
  );
}

// ============================================================
// HEADER
// ============================================================

function drawHeader(
  doc: jsPDF,
  instituteName: string,
  address: string,
  logo?: string | null
): void {
  const x = 3;
  const y = 3;
  const w = 64;
  const h = 21;

  doc.setFillColor(COLORS.navy);

  doc.roundedRect(
    x,
    y,
    w,
    h,
    3,
    3,
    'F'
  );

  doc.rect(
    x,
    y + 10,
    w,
    11,
    'F'
  );

  // Orange accent
  doc.setFillColor(COLORS.orange);

  doc.rect(
    x + 1,
    22.5,
    w - 2,
    0.8,
    'F'
  );

  // Logo
  if (logo) {
    try {
      addImageSafe(
        doc,
        logo,
        5,
        6,
        10,
        10
      );
    } catch {
      drawFallbackLogo(doc, 10, 11);
    }
  } else {
    drawFallbackLogo(doc, 10, 11);
  }

  const textX = 18;

  // ----------------------------------------------------------
  // INSTITUTE NAME
  // ----------------------------------------------------------

  doc.setTextColor(COLORS.white);
  doc.setFont('helvetica', 'bold');

  let fontSize = 6.2;

  if (instituteName.length > 30) {
    fontSize = 5.2;
  } else if (instituteName.length > 24) {
    fontSize = 5.7;
  }

  doc.setFontSize(fontSize);

  const nameLines = doc.splitTextToSize(
    instituteName,
    47
  );

  doc.text(
    nameLines.slice(0, 2),
    textX,
    9
  );

  // ----------------------------------------------------------
  // INSTITUTE SUBTITLE
  // ----------------------------------------------------------

  doc.setTextColor(COLORS.orangeLight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.8);

  doc.text(
    'INSTITUTE OF MANAGEMENT',
    textX,
    16
  );

  // ----------------------------------------------------------
  // DEPARTMENT
  // ----------------------------------------------------------

  doc.setTextColor('#D7DFEA');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(3.35);

  doc.text(
    'HOSPITALITY • BARTENDING • MANAGEMENT',
    textX,
    19.3
  );

  // ----------------------------------------------------------
  // LOCATION
  // ----------------------------------------------------------

  doc.setFontSize(3.1);

  doc.text(
    shorten(address, 48),
    CARD_W / 2,
    22,
    {
      align: 'center',
    }
  );
}

// ============================================================
// IDENTITY SECTION
// ============================================================

function drawIdentitySection(
  doc: jsPDF,
  studentName: string,
  course: string,
  rollNumber: string,
  photo?: string | null
): void {
  const photoX = 6;
  const photoY = 28;
  const photoW = 22;
  const photoH = 27;

  // ----------------------------------------------------------
  // PHOTO FRAME
  // ----------------------------------------------------------

  doc.setFillColor(COLORS.white);
  doc.setDrawColor(COLORS.orange);
  doc.setLineWidth(0.75);

  doc.roundedRect(
    photoX - 1,
    photoY - 1,
    photoW + 2,
    photoH + 2,
    2.5,
    2.5,
    'FD'
  );

  if (photo) {
    try {
      addImageSafe(
        doc,
        photo,
        photoX,
        photoY,
        photoW,
        photoH,
        'JPEG'
      );
    } catch {
      drawPhotoFallback(
        doc,
        photoX + photoW / 2,
        photoY + photoH / 2
      );
    }
  } else {
    drawPhotoFallback(
      doc,
      photoX + photoW / 2,
      photoY + photoH / 2
    );
  }

  doc.setDrawColor(COLORS.navy);
  doc.setLineWidth(0.3);

  doc.roundedRect(
    photoX,
    photoY,
    photoW,
    photoH,
    1.4,
    1.4,
    'S'
  );

  // ----------------------------------------------------------
  // IDENTITY TEXT
  // ----------------------------------------------------------

  const infoX = 33;
  const infoW = 31;

  // Small section label
  drawTrackedLabel(
    doc,
    'STUDENT IDENTITY',
    infoX,
    31,
    COLORS.muted,
    4
  );

  doc.setDrawColor(COLORS.orange);
  doc.setLineWidth(0.4);

  doc.line(
    infoX,
    33,
    infoX + infoW,
    33
  );

  // ----------------------------------------------------------
  // STUDENT NAME
  // ----------------------------------------------------------

  let nameSize = 9;

  if (studentName.length > 25) {
    nameSize = 6.8;
  } else if (studentName.length > 20) {
    nameSize = 7.8;
  } else if (studentName.length > 16) {
    nameSize = 8.5;
  }

  doc.setTextColor(COLORS.navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(nameSize);

  const nameLines = doc.splitTextToSize(
    studentName,
    infoW
  );

  doc.text(
    nameLines.slice(0, 2),
    infoX,
    39
  );

  // ----------------------------------------------------------
  // STUDENT BADGE
  // ----------------------------------------------------------

  const badgeY =
    39 +
    nameLines.slice(0, 2).length * 3.5 +
    1.5;

  doc.setFillColor(COLORS.orange);

  doc.roundedRect(
    infoX,
    badgeY,
    17,
    4.1,
    2,
    2,
    'F'
  );

  doc.setTextColor(COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.4);

  doc.text(
    'STUDENT',
    infoX + 8.5,
    badgeY + 2.75,
    {
      align: 'center',
    }
  );

  // ----------------------------------------------------------
  // COURSE LABEL
  // ----------------------------------------------------------

  drawTrackedLabel(
    doc,
    'COURSE',
    infoX,
    51,
    COLORS.muted,
    3.6
  );

  // Course
  let courseSize = 4.7;

  if (course.length > 24) {
    courseSize = 3.8;
  } else if (course.length > 18) {
    courseSize = 4.2;
  }

  doc.setTextColor(COLORS.orange);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(courseSize);

  const courseLines = doc.splitTextToSize(
    course.toUpperCase(),
    infoW
  );

  doc.text(
    courseLines.slice(0, 2),
    infoX,
    54.2
  );

  // ----------------------------------------------------------
  // ROLL NUMBER
  // ----------------------------------------------------------

  drawTrackedLabel(
    doc,
    'ROLL NUMBER',
    infoX,
    62,
    COLORS.muted,
    3.5
  );

  doc.setTextColor(COLORS.navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);

  doc.text(
    rollNumber,
    infoX,
    65
  );

  // Divider
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.25);

  doc.line(
    6,
    68,
    64,
    68
  );
}

// ============================================================
// CONTACT INFORMATION
// ============================================================

function drawContactSection(
  doc: jsPDF,
  address: string,
  email: string,
  phone: string
): void {
  const startY = 72;

  drawTrackedLabel(
    doc,
    'CONTACT INFORMATION',
    6,
    startY,
    COLORS.navy,
    4.5
  );

  doc.setDrawColor(COLORS.orange);
  doc.setLineWidth(0.4);

  doc.line(
    6,
    startY + 2,
    64,
    startY + 2
  );

  drawContactRow(
    doc,
    'A',
    'ADDRESS',
    address,
    79
  );

  drawContactRow(
    doc,
    '@',
    'EMAIL',
    email,
    86
  );

  drawContactRow(
    doc,
    'P',
    'CONTACT',
    phone,
    93
  );
}

// ============================================================
// CONTACT ROW
// ============================================================

function drawContactRow(
  doc: jsPDF,
  icon: string,
  label: string,
  value: string,
  y: number
): void {
  doc.setFillColor(COLORS.light);

  doc.roundedRect(
    5,
    y - 3.3,
    60,
    5.8,
    1.3,
    1.3,
    'F'
  );

  // Icon
  doc.setFillColor(COLORS.navy);

  doc.circle(
    9,
    y - 0.3,
    2,
    'F'
  );

  doc.setTextColor(COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(2.9);

  doc.text(
    icon,
    9,
    y + 0.75,
    {
      align: 'center',
    }
  );

  // Label
  drawTrackedLabel(
    doc,
    label,
    14,
    y,
    COLORS.muted,
    3.3
  );

  // Value
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'normal');

  let valueSize = 3.9;

  if (String(value).length > 34) {
    valueSize = 3.5;
  }

  doc.setFontSize(valueSize);

  const lines = doc.splitTextToSize(
    clean(value),
    36
  );

  doc.text(
    lines[0] || '-',
    26,
    y
  );
}

// ============================================================
// AUTHORIZATION
// ============================================================

function drawAuthorization(
  doc: jsPDF,
  settings?: SiteSettings | null
): void {
  // Separator
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.25);

  doc.line(
    6,
    96,
    64,
    96
  );

  // ----------------------------------------------------------
  // SEAL
  // ----------------------------------------------------------

  const sealX = 15;
  const sealY = 98.5;
  const sealSize = 12;

  if (settings?.office_seal_base64) {
    try {
      addImageSafe(
        doc,
        settings.office_seal_base64,
        sealX - sealSize / 2,
        sealY - sealSize / 2,
        sealSize,
        sealSize
      );
    } catch {
      drawSealFallback(
        doc,
        sealX,
        sealY
      );
    }
  } else {
    drawSealFallback(
      doc,
      sealX,
      sealY
    );
  }

  // ----------------------------------------------------------
  // SIGNATURE
  // ----------------------------------------------------------

  const sigX = 51;
  const sigY = 94;
  const sigW = 25;
  const sigH = 9;

  if (settings?.hod_signature_base64) {
    try {
      addImageSafe(
        doc,
        settings.hod_signature_base64,
        sigX - sigW / 2,
        sigY,
        sigW,
        sigH
      );
    } catch {
      drawSignatureLine(
        doc,
        sigX
      );
    }
  } else {
    drawSignatureLine(
      doc,
      sigX
    );
  }

  // Signature line
  doc.setDrawColor(COLORS.muted);
  doc.setLineWidth(0.3);

  doc.line(
    sigX - 13,
    104,
    sigX + 13,
    104
  );

  // Labels
  drawTrackedLabel(
    doc,
    'OFFICIAL SEAL',
    sealX,
    108,
    COLORS.muted,
    3
  );

  drawTrackedLabel(
    doc,
    'AUTHORIZED SIGNATURE',
    sigX,
    108,
    COLORS.muted,
    3
  );
}

// ============================================================
// FOOTER
// ============================================================

function drawFooter(
  doc: jsPDF
): void {
  const x = 3;
  const y = 109;
  const w = 64;
  const h = 5;

  doc.setFillColor(COLORS.navy);

  doc.roundedRect(
    x,
    y,
    w,
    h,
    2,
    2,
    'F'
  );

  // Orange accent
  doc.setFillColor(COLORS.orange);

  doc.rect(
    x + 2,
    y,
    w - 4,
    0.55,
    'F'
  );

  // Footer institute
  doc.setTextColor(COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.5);

  doc.text(
    'SKYLINE INSTITUTE',
    CARD_W / 2,
    y + 3.15,
    {
      align: 'center',
    }
  );

  // Footer tagline
  doc.setTextColor('#CBD5E1');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(2.3);

  doc.text(
    'LEARN • LEAD • CREATE EXPERIENCES',
    CARD_W / 2,
    y + 4.45,
    {
      align: 'center',
    }
  );
}

// ============================================================
// TYPOGRAPHY HELPER
// ============================================================

function drawTrackedLabel(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  color: string,
  size: number
): void {
  doc.setTextColor(color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size);

  // jsPDF doesn't have reliable letter-spacing
  // across all versions, so use slightly spaced
  // characters for short uppercase labels.
  const spaced = text
    .toUpperCase()
    .split('')
    .join(' ');

  doc.text(
    spaced,
    x,
    y
  );
}

// ============================================================
// FALLBACK LOGO
// ============================================================

function drawFallbackLogo(
  doc: jsPDF,
  cx: number,
  cy: number
): void {
  doc.setFillColor(COLORS.white);

  doc.circle(
    cx,
    cy,
    5,
    'F'
  );

  doc.setFillColor(COLORS.navy);

  doc.circle(
    cx,
    cy,
    4,
    'F'
  );

  doc.setFillColor(COLORS.orange);

  doc.rect(
    cx - 2,
    cy - 2,
    1.2,
    4.5,
    'F'
  );

  doc.rect(
    cx - 0.3,
    cy - 3,
    1.2,
    5.5,
    'F'
  );

  doc.rect(
    cx + 1.4,
    cy - 1.2,
    1.2,
    3.7,
    'F'
  );
}

// ============================================================
// PHOTO FALLBACK
// ============================================================

function drawPhotoFallback(
  doc: jsPDF,
  cx: number,
  cy: number
): void {
  doc.setFillColor(COLORS.navy);

  doc.roundedRect(
    cx - 10,
    cy - 12,
    20,
    24,
    1.5,
    1.5,
    'F'
  );

  doc.setTextColor(COLORS.white);
  doc.setFont('times', 'bold');
  doc.setFontSize(13);

  doc.text(
    'S',
    cx,
    cy + 4,
    {
      align: 'center',
    }
  );

  doc.setDrawColor(COLORS.orange);
  doc.setLineWidth(0.7);

  doc.line(
    cx - 5,
    cy + 6,
    cx + 5,
    cy + 6
  );
}

// ============================================================
// SEAL FALLBACK
// ============================================================

function drawSealFallback(
  doc: jsPDF,
  cx: number,
  cy: number
): void {
  doc.setDrawColor(COLORS.navy);
  doc.setLineWidth(0.65);

  doc.circle(
    cx,
    cy,
    6,
    'S'
  );

  doc.setDrawColor(COLORS.orange);
  doc.setLineWidth(0.3);

  doc.circle(
    cx,
    cy,
    4.7,
    'S'
  );

  doc.setTextColor(COLORS.navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(2.4);

  doc.text(
    'SKYLINE',
    cx,
    cy - 0.5,
    {
      align: 'center',
    }
  );

  doc.setFontSize(2);

  doc.text(
    'OFFICIAL',
    cx,
    cy + 2,
    {
      align: 'center',
    }
  );
}

// ============================================================
// SIGNATURE FALLBACK
// ============================================================

function drawSignatureLine(
  doc: jsPDF,
  cx: number
): void {
  doc.setDrawColor(COLORS.muted);
  doc.setLineWidth(0.3);

  doc.line(
    cx - 13,
    102,
    cx + 13,
    102
  );
}

// ============================================================
// NAME FORMATTER
// ============================================================

function formatStudentName(
  value: string
): string {
  const name = clean(value);

  if (!name) {
    return 'STUDENT';
  }

  const lower = name.toLowerCase();

  const hasTitle =
    lower.startsWith('mr ') ||
    lower.startsWith('mr.') ||
    lower.startsWith('mrs ') ||
    lower.startsWith('mrs.') ||
    lower.startsWith('miss ') ||
    lower.startsWith('miss.') ||
    lower.startsWith('ms ') ||
    lower.startsWith('ms.');

  const formatted = name
    .toLowerCase()
    .split(' ')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');

  return hasTitle
    ? formatted
    : `Mr. ${formatted}`;
}

// ============================================================
// TEXT HELPERS
// ============================================================

function clean(
  value: string
): string {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shorten(
  value: string,
  maxLength: number
): string {
  const text = clean(value);

  if (text.length <= maxLength) {
    return text;
  }

  return (
    text.substring(
      0,
      maxLength - 3
    ) + '...'
  );
}
