import { jsPDF } from 'jspdf';
import type { Student, SiteSettings } from '@/types';
import {
  drawOfficialSeal,
  drawDirectorSignature,
  addImageSafe,
} from './common';

// ============================================================
// TYPES
// ============================================================

type ResultRow = {
  subject: string;
  obt: number;
  max: number;
};

type ExamGroup = {
  exam: string;
  subjects: ResultRow[];
};

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  navy: '#0F172A',
  navy2: '#1E293B',
  gold: '#B8860B',
  goldLight: '#D4AF37',
  goldPale: '#FEF3C7',
  cream: '#FAF7EE',
  cream2: '#FFFDF2',
  white: '#FFFFFF',
  gray: '#475569',
  gray2: '#64748B',
  gray3: '#94A3B8',
  border: '#CBD5E1',
  green: '#15803D',
  red: '#991B1B',
  brown: '#78350F',
};

const PAGE = {
  width: 297,
  height: 210,
  margin: 8,
};

const LEFT = {
  x: 12,
  width: 132,
};

const RIGHT = {
  x: 151,
  width: 134,
};

// ============================================================
// HELPERS
// ============================================================

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, '');
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function generateEnrollmentId(
  studentId: string,
  rollNumber: string
): string {
  let hash = 178451;
  const str = `${studentId || ''}${rollNumber || ''}`;

  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 10000000;
  }

  return `17845${String(hash).padStart(7, '0')}`;
}

function getGraduationDate(student: Student): string {
  const results = student.results_records || [];

  if (results.length === 0) {
    return student.reg_date || '';
  }

  const latest = results.reduce((prev, curr) => {
    const prevDate = prev.created_at
      ? new Date(prev.created_at).getTime()
      : 0;

    const currDate = curr.created_at
      ? new Date(curr.created_at).getTime()
      : 0;

    return currDate > prevDate ? curr : prev;
  }, results[0]);

  return latest?.created_at || student.reg_date || '';
}

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

function getClassification(pct: number): string {
  if (pct >= 85) return 'DISTINCTION';
  if (pct >= 75) return 'FIRST CLASS';
  if (pct >= 65) return 'MERIT';
  if (pct >= 50) return 'PASS';
  return 'NEEDS IMPROVEMENT';
}

function getResultStatus(pct: number): 'PASS' | 'FAIL' {
  return pct >= 33 ? 'PASS' : 'FAIL';
}

function getCourseLevel(courseId?: string): string {
  if (courseId === 'course-2') return 'LEVEL 2';
  if (courseId === 'course-3') return 'LEVEL 3';
  return 'LEVEL 1';
}

function getBatchYear(rollNumber?: string): string {
  const year = rollNumber?.substring(0, 4);

  if (year && /^\d{4}$/.test(year)) {
    return year;
  }

  return new Date().getFullYear().toString();
}

function groupResults(student: Student): ExamGroup[] {
  const results = student.results_records || [];

  const grouped: Record<string, ResultRow[]> = {};

  results.forEach((result) => {
    const exam = String(result.exam_name || 'FINAL ASSESSMENT');

    if (!grouped[exam]) {
      grouped[exam] = [];
    }

    grouped[exam].push({
      subject: String(result.subject || 'Subject'),
      obt: Math.max(0, safeNumber(result.marks_obtained)),
      max: Math.max(0, safeNumber(result.max_marks)),
    });
  });

  return Object.entries(grouped).map(([exam, subjects]) => ({
    exam,
    subjects,
  }));
}

// ============================================================
// DRAWING HELPERS
// ============================================================

function setText(
  doc: jsPDF,
  color: string,
  size: number,
  font = 'helvetica',
  style: 'normal' | 'bold' | 'italic' = 'normal'
) {
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

function drawRoundedBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string,
  radius = 2
) {
  doc.setFillColor(fill);
  doc.setDrawColor(stroke);
  doc.roundedRect(x, y, w, h, radius, radius, 'FD');
}

function drawOrnamentalDivider(
  doc: jsPDF,
  y: number,
  x1: number,
  x2: number
) {
  const cx = (x1 + x2) / 2;

  doc.saveGraphicsState();

  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.35);
  doc.setFillColor(COLORS.gold);

  doc.line(x1, y, cx - 7, y);
  doc.line(cx + 7, y, x2, y);

  doc.circle(cx, y, 1.15, 'F');
  doc.setDrawColor(COLORS.goldLight);
  doc.setLineWidth(0.25);
  doc.circle(cx, y, 2.2, 'S');

  doc.restoreGraphicsState();
}

function drawPremiumFrame(doc: jsPDF) {
  doc.setFillColor(COLORS.cream);
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

  // Outer gold border
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(1.4);
  doc.rect(
    PAGE.margin,
    PAGE.margin,
    PAGE.width - PAGE.margin * 2,
    PAGE.height - PAGE.margin * 2,
    'S'
  );

  // Inner border
  doc.setDrawColor(COLORS.goldLight);
  doc.setLineWidth(0.3);
  doc.rect(
    PAGE.margin + 2,
    PAGE.margin + 2,
    PAGE.width - (PAGE.margin + 2) * 2,
    PAGE.height - (PAGE.margin + 2) * 2,
    'S'
  );

  // Corner ornaments
  const size = 5;

  doc.setFillColor(COLORS.gold);

  doc.rect(PAGE.margin, PAGE.margin, size, 1.3, 'F');
  doc.rect(PAGE.margin, PAGE.margin, 1.3, size, 'F');

  doc.rect(
    PAGE.width - PAGE.margin - size,
    PAGE.margin,
    size,
    1.3,
    'F'
  );
  doc.rect(
    PAGE.width - PAGE.margin - 1.3,
    PAGE.margin,
    1.3,
    size,
    'F'
  );

  doc.rect(
    PAGE.margin,
    PAGE.height - PAGE.margin - 1.3,
    size,
    1.3,
    'F'
  );
  doc.rect(
    PAGE.margin,
    PAGE.height - PAGE.margin - size,
    1.3,
    size,
    'F'
  );

  doc.rect(
    PAGE.width - PAGE.margin - size,
    PAGE.height - PAGE.margin - 1.3,
    size,
    1.3,
    'F'
  );
  doc.rect(
    PAGE.width - PAGE.margin - 1.3,
    PAGE.height - PAGE.margin - size,
    1.3,
    size,
    'F'
  );
}

function drawVectorBadge(
  doc: jsPDF,
  centerX: number,
  centerY: number
) {
  doc.saveGraphicsState();

  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(1);
  doc.circle(centerX, centerY, 8, 'S');

  doc.setLineWidth(0.35);
  doc.circle(centerX, centerY, 6.4, 'S');

  doc.setFillColor(COLORS.navy);
  doc.circle(centerX, centerY, 5, 'F');

  setText(doc, '#FFD700', 5.5, 'helvetica', 'bold');
  doc.text('S', centerX, centerY - 1.2, {
    align: 'center',
  });

  doc.text('I', centerX, centerY + 2.8, {
    align: 'center',
  });

  doc.restoreGraphicsState();
}

function drawPill(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  fill: string,
  textColor = COLORS.white
) {
  doc.setFillColor(fill);
  doc.roundedRect(x, y, width, 6, 3, 3, 'F');

  setText(doc, textColor, 6, 'helvetica', 'bold');

  doc.text(text, x + width / 2, y + 4, {
    align: 'center',
  });
}

function drawInfoItem(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  setText(doc, COLORS.gray, 5.5, 'helvetica', 'bold');
  doc.text(label, x, y);

  setText(doc, COLORS.navy, 6.5, 'helvetica', 'bold');

  const lines = doc.splitTextToSize(value || '-', width - 28);

  doc.text(lines, x + 28, y);

  doc.setDrawColor(COLORS.gray3);
  doc.setLineWidth(0.2);

  doc.line(
    x + 28,
    y + 1.5,
    x + width,
    y + 1.5
  );
}

// ============================================================
// MAIN PDF GENERATOR
// ============================================================

export function downloadResultsPdf(
  student: Student,
  settings?: SiteSettings | null
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const instituteName = (
    settings?.institute_name || 'SKYLINE INSTITUTE'
  ).toUpperCase();

  const address = settings?.contact_address || '';

  const studentName = (
    student.name || 'STUDENT'
  ).toUpperCase();

  const courseName =
    student.course_name || 'Professional Course';

  const results = student.results_records || [];

  const groups = groupResults(student);

  // ==========================================================
  // CALCULATE TOTALS
  // ==========================================================

  let grandObt = 0;
  let grandMax = 0;

  groups.forEach((group) => {
    group.subjects.forEach((subject) => {
      grandObt += subject.obt;
      grandMax += subject.max;
    });
  });

  const percentage =
    grandMax > 0
      ? Math.min(100, Math.max(0, (grandObt / grandMax) * 100))
      : 0;

  const grade = getGrade(percentage);
  const classification = getClassification(percentage);
  const status = getResultStatus(percentage);

  // ==========================================================
  // BACKGROUND
  // ==========================================================

  drawPremiumFrame(doc);

  // ==========================================================
  // HEADER
  // ==========================================================

  const headerY = 11;

  const logo = settings?.site_logo_base64;

  if (logo) {
    addImageSafe(
      doc,
      logo,
      13,
      headerY,
      17,
      17
    );
  }

  const headerX = logo ? 34 : 13;

  setText(
    doc,
    COLORS.navy,
    12,
    'helvetica',
    'bold'
  );

  doc.text(
    instituteName,
    headerX,
    headerY + 6
  );

  setText(
    doc,
    COLORS.gray,
    5.5,
    'helvetica',
    'normal'
  );

  if (address) {
    const addressLines = doc.splitTextToSize(
      address,
      100
    );

    doc.text(
      addressLines,
      headerX,
      headerY + 10
    );
  }

  // Accreditation badge
  const badgeX = 267;
  const badgeY = 19;

  drawVectorBadge(
    doc,
    badgeX,
    badgeY
  );

  setText(
    doc,
    COLORS.navy,
    5.5,
    'helvetica',
    'bold'
  );

  doc.text(
    'ACCREDITED',
    badgeX,
    29,
    { align: 'center' }
  );

  setText(
    doc,
    COLORS.gray,
    4,
    'helvetica',
    'normal'
  );

  doc.text(
    'HOSPITALITY & BARTENDING',
    badgeX,
    33,
    { align: 'center' }
  );

  drawOrnamentalDivider(
    doc,
    37,
    13,
    284
  );

  // ==========================================================
  // LEFT CERTIFICATE PANEL
  // ==========================================================

  const leftX = LEFT.x;
  const leftW = LEFT.width;
  const leftCX = leftX + leftW / 2;

  // Small heading
  setText(
    doc,
    COLORS.red,
    6.5,
    'helvetica',
    'bold'
  );

  doc.text(
    'ACADEMIC REGISTRY & GRADUATION SERVICES',
    leftCX,
    45,
    { align: 'center' }
  );

  // Main title
  setText(
    doc,
    COLORS.navy,
    18,
    'times',
    'bold'
  );

  doc.text(
    'PASS OUT CERTIFICATE',
    leftCX,
    54,
    { align: 'center' }
  );

  setText(
    doc,
    COLORS.gold,
    6.5,
    'helvetica',
    'bold'
  );

  doc.text(
    'MIXOLOGY LAB  •  BARTENDING SCHOOL',
    leftCX,
    60,
    { align: 'center' }
  );

  drawOrnamentalDivider(
    doc,
    64,
    leftX + 4,
    leftX + leftW - 4
  );

  // Photo
  const photoW = 22;
  const photoH = 29.3;

  const photoX = leftX + leftW - photoW - 4;
  const photoY = 42;

  const photo = student.photo_base64;

  if (photo) {
    addImageSafe(
      doc,
      photo,
      photoX,
      photoY,
      photoW,
      photoH,
      'JPEG'
    );
  } else {
    doc.setFillColor('#E5E7EB');
    doc.rect(
      photoX,
      photoY,
      photoW,
      photoH,
      'F'
    );

    setText(
      doc,
      COLORS.gray3,
      5,
      'helvetica',
      'bold'
    );

    doc.text(
      'PHOTO',
      photoX + photoW / 2,
      photoY + photoH / 2,
      { align: 'center' }
    );
  }

  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.7);

  doc.rect(
    photoX,
    photoY,
    photoW,
    photoH,
    'S'
  );

  // Certificate text
  let cy = 73;

  setText(
    doc,
    COLORS.gray,
    8.5,
    'times',
    'bold'
  );

  doc.text(
    'THIS IS TO CERTIFY THAT',
    leftCX - 7,
    cy,
    { align: 'center' }
  );

  cy += 9;

  // Student name
  let nameFontSize = 21;

  if (studentName.length > 24) {
    nameFontSize = 17;
  } else if (studentName.length > 18) {
    nameFontSize = 19;
  }

  setText(
    doc,
    COLORS.brown,
    nameFontSize,
    'times',
    'bold'
  );

  const nameMaxWidth = leftW - 10;

  const nameLines = doc.splitTextToSize(
    studentName,
    nameMaxWidth
  );

  doc.text(
    nameLines,
    leftCX,
    cy,
    { align: 'center' }
  );

  cy += nameLines.length * 7 + 2;

  doc.setDrawColor(COLORS.gray3);
  doc.setLineWidth(0.25);

  doc.line(
    leftX + 7,
    cy,
    leftX + leftW - 7,
    cy
  );

  cy += 6;

  // Certificate statement
  setText(
    doc,
    '#334155',
    7.5,
    'times',
    'italic'
  );

  const statement =
    `has successfully completed the ${courseName} at ${instituteName} and has successfully passed the final assessment.`;

  const statementLines = doc.splitTextToSize(
    statement,
    leftW - 12
  );

  doc.text(
    statementLines,
    leftX + 6,
    cy
  );

  cy += statementLines.length * 4.5 + 4;

  // Level
  const level = getCourseLevel(
    student.course_id
  );

  drawPill(
    doc,
    level,
    leftX + 5,
    cy,
    29,
    COLORS.gold
  );

  // ==========================================================
  // STUDENT INFORMATION
  // ==========================================================

  const infoY = 124;

  drawRoundedBox(
    doc,
    leftX + 4,
    infoY - 4,
    leftW - 8,
    25,
    COLORS.cream2,
    '#E5D9A8',
    1.5
  );

  const batchYear = getBatchYear(
    student.roll_number
  );

  const gradDate = formatDate(
    getGraduationDate(student)
  );

  const enrollmentId = generateEnrollmentId(
    student.id,
    student.roll_number || ''
  );

  drawInfoItem(
    doc,
    'BATCH',
    `${batchYear}-${Number(batchYear) + 1}`,
    leftX + 8,
    infoY + 3,
    50
  );

  drawInfoItem(
    doc,
    'COMPLETED',
    gradDate,
    leftX + 8,
    infoY + 10,
    50
  );

  drawInfoItem(
    doc,
    'ENROLLMENT',
    enrollmentId,
    leftX + 8,
    infoY + 17,
    50
  );

  // ==========================================================
  // SEAL
  // ==========================================================

  const sealX = leftX + 22;
  const sealY = 160;

  const sealB64 = settings?.office_seal_base64;

  if (sealB64) {
    addImageSafe(
      doc,
      sealB64,
      sealX - 10,
      sealY - 10,
      22,
      22
    );
  } else {
    drawOfficialSeal(
      doc,
      sealX,
      sealY,
      9,
      false
    );
  }

  setText(
    doc,
    COLORS.gray,
    5.5,
    'helvetica',
    'bold'
  );

  doc.text(
    'OFFICIAL SEAL',
    sealX,
    174,
    { align: 'center' }
  );

  // ==========================================================
  // SIGNATURE
  // ==========================================================

  const sigX = leftX + 87;

  const signature =
    settings?.hod_signature_base64;

  if (signature) {
    addImageSafe(
      doc,
      signature,
      sigX - 20,
      146,
      40,
      18
    );
  } else {
    drawDirectorSignature(
      doc,
      sigX,
      158
    );
  }

  doc.setDrawColor(COLORS.gray3);
  doc.setLineWidth(0.25);

  doc.line(
    sigX - 20,
    166,
    sigX + 20,
    166
  );

  setText(
    doc,
    COLORS.gray,
    5.5,
    'helvetica',
    'bold'
  );

  doc.text(
    'AUTHORIZED REGISTRAR',
    sigX,
    170,
    { align: 'center' }
  );

  // Footer slogan
  setText(
    doc,
    COLORS.gold,
    6.5,
    'helvetica',
    'bold'
  );

  doc.text(
    'RAISE THE BAR  •  CREATE EXPERIENCES',
    leftCX,
    195,
    { align: 'center' }
  );

  // ==========================================================
  // VERTICAL DIVIDER
  // ==========================================================

  doc.setDrawColor(COLORS.goldLight);
  doc.setLineWidth(0.5);

  doc.line(
    147,
    41,
    147,
    198
  );

  // ==========================================================
  // RIGHT RESULT PANEL
  // ==========================================================

  const rightX = RIGHT.x;
  const rightW = RIGHT.width;

  // Title box
  drawRoundedBox(
    doc,
    rightX,
    41,
    rightW,
    10,
    COLORS.cream2,
    COLORS.gold,
    1.5
  );

  setText(
    doc,
    COLORS.navy,
    8,
    'helvetica',
    'bold'
  );

  doc.text(
    'FINAL ASSESSMENT RESULT',
    rightX + rightW / 2,
    47.5,
    { align: 'center' }
  );

  // Student mini info
  setText(
    doc,
    COLORS.gray,
    5.5,
    'helvetica',
    'bold'
  );

  doc.text(
    `ROLL NO: ${student.roll_number || '-'}`,
    rightX,
    57
  );

  doc.text(
    `COURSE: ${courseName}`,
    rightX + 70,
    57,
    { maxWidth: 85 }
  );

  let ry = 61;

  // ==========================================================
  // NO RESULTS
  // ==========================================================

  if (groups.length === 0) {
    drawRoundedBox(
      doc,
      rightX,
      ry,
      rightW,
      30,
      COLORS.cream2,
      COLORS.border,
      2
    );

    setText(
      doc,
      COLORS.gray,
      8,
      'helvetica',
      'bold'
    );

    doc.text(
      'NO RESULT DATA AVAILABLE',
      rightX + rightW / 2,
      ry + 13,
      { align: 'center' }
    );

    setText(
      doc,
      COLORS.gray2,
      5.5,
      'helvetica',
      'normal'
    );

    doc.text(
      'Assessment records have not been entered yet.',
      rightX + rightW / 2,
      ry + 20,
      { align: 'center' }
    );
  }

  // ==========================================================
  // RESULT TABLE
  // ==========================================================

  const tableX = rightX;
  const tableW = rightW;

  const subjectX = tableX;
  const maxX = tableX + 80;
  const obtX = tableX + 102;
  const pctX = tableX + 124;

  if (groups.length > 0) {
    // Table header
    doc.setFillColor(COLORS.navy);
    doc.rect(
      tableX,
      ry,
      tableW,
      6,
      'F'
    );

    setText(
      doc,
      COLORS.white,
      5.5,
      'helvetica',
      'bold'
    );

    doc.text(
      'SUBJECT / ASSESSMENT',
      subjectX + 2,
      ry + 4
    );

    doc.text(
      'MAX',
      maxX,
      ry + 4,
      { align: 'center' }
    );

    doc.text(
      'OBT.',
      obtX,
      ry + 4,
      { align: 'center' }
    );

    doc.text(
      '%',
      pctX,
      ry + 4,
      { align: 'center' }
    );

    ry += 6;

    // Groups
    groups.forEach((group) => {
      // Exam heading
      doc.setFillColor('#C59228');

      doc.rect(
        tableX,
        ry,
        tableW,
        5,
        'F'
      );

      setText(
        doc,
        COLORS.white,
        5.5,
        'helvetica',
        'bold'
      );

      doc.text(
        group.exam.toUpperCase(),
        tableX + 2,
        ry + 3.4
      );

      ry += 5;

      // Subjects
      group.subjects.forEach((subject) => {
        const subjectLines = doc.splitTextToSize(
          subject.subject,
          72
        );

        const rowHeight =
          Math.max(
            5.2,
            subjectLines.length * 3.3 + 1.5
          );

        // Row background
        doc.setFillColor(
          rowHeight > 6
            ? '#FFFDF7'
            : COLORS.white
        );

        doc.rect(
          tableX,
          ry,
          tableW,
          rowHeight,
          'F'
        );

        doc.setDrawColor(
          COLORS.border
        );

        doc.setLineWidth(0.18);

        doc.rect(
          tableX,
          ry,
          tableW,
          rowHeight,
          'S'
        );

        setText(
          doc,
          COLORS.navy2,
          5.2,
          'helvetica',
          'normal'
        );

        doc.text(
          subjectLines,
          subjectX + 2,
          ry + 3.5
        );

        setText(
          doc,
          COLORS.navy,
          5.5,
          'helvetica',
          'bold'
        );

        doc.text(
          formatNumber(subject.max),
          maxX,
          ry + 3.5,
          { align: 'center' }
        );

        doc.text(
          formatNumber(subject.obt),
          obtX,
          ry + 3.5,
          { align: 'center' }
        );

        const subjectPct =
          subject.max > 0
            ? (subject.obt / subject.max) * 100
            : 0;

        doc.text(
          `${subjectPct.toFixed(0)}`,
          pctX,
          ry + 3.5,
          { align: 'center' }
        );

        ry += rowHeight;
      });

      // Category total
      const catMax = group.subjects.reduce(
        (sum, item) => sum + item.max,
        0
      );

      const catObt = group.subjects.reduce(
        (sum, item) => sum + item.obt,
        0
      );

      doc.setFillColor(
        COLORS.goldPale
      );

      doc.rect(
        tableX,
        ry,
        tableW,
        5,
        'F'
      );

      setText(
        doc,
        COLORS.navy,
        5.5,
        'helvetica',
        'bold'
      );

      doc.text(
        'TOTAL',
        subjectX + 2,
        ry + 3.4
      );

      doc.text(
        formatNumber(catMax),
        maxX,
        ry + 3.4,
        { align: 'center' }
      );

      doc.text(
        formatNumber(catObt),
        obtX,
        ry + 3.4,
        { align: 'center' }
      );

      const catPct =
        catMax > 0
          ? (catObt / catMax) * 100
          : 0;

      doc.text(
        `${catPct.toFixed(0)}`,
        pctX,
        ry + 3.4,
        { align: 'center' }
      );

      ry += 6;
    });

    // ========================================================
    // GRAND TOTAL
    // ========================================================

    doc.setFillColor(
      COLORS.navy
    );

    doc.rect(
      tableX,
      ry,
      tableW,
      7,
      'F'
    );

    setText(
      doc,
      COLORS.white,
      6.2,
      'helvetica',
      'bold'
    );

    doc.text(
      'GRAND TOTAL',
      subjectX + 2,
      ry + 4.6
    );

    doc.text(
      formatNumber(grandMax),
      maxX,
      ry + 4.6,
      { align: 'center' }
    );

    doc.text(
      formatNumber(grandObt),
      obtX,
      ry + 4.6,
      { align: 'center' }
    );

    doc.text(
      `${percentage.toFixed(1)}`,
      pctX,
      ry + 4.6,
      { align: 'center' }
    );

    ry += 10;
  }

  // ==========================================================
  // RESULT SUMMARY CARDS
  // ==========================================================

  const cardY = Math.min(
    Math.max(ry, 116),
    145
  );

  const cardGap = 3;
  const cardW =
    (rightW - cardGap * 2) / 3;

  // Percentage
  drawRoundedBox(
    doc,
    rightX,
    cardY,
    cardW,
    22,
    COLORS.cream2,
    COLORS.gold,
    1.5
  );

  setText(
    doc,
    COLORS.gold,
    5,
    'helvetica',
    'bold'
  );

  doc.text(
    'PERCENTAGE',
    rightX + cardW / 2,
    cardY + 6,
    { align: 'center' }
  );

  setText(
    doc,
    COLORS.navy,
    12,
    'helvetica',
    'bold'
  );

  doc.text(
    `${percentage.toFixed(1)}%`,
    rightX + cardW / 2,
    cardY + 16,
    { align: 'center' }
  );

  // Grade
  const gradeX =
    rightX + cardW + cardGap;

  drawRoundedBox(
    doc,
    gradeX,
    cardY,
    cardW,
    22,
    COLORS.cream2,
    COLORS.gold,
    1.5
  );

  setText(
    doc,
    COLORS.gold,
    5,
    'helvetica',
    'bold'
  );

  doc.text(
    'GRADE',
    gradeX + cardW / 2,
    cardY + 6,
    { align: 'center' }
  );

  setText(
    doc,
    COLORS.navy,
    12,
    'helvetica',
    'bold'
  );

  doc.text(
    grade,
    gradeX + cardW / 2,
    cardY + 16,
    { align: 'center' }
  );

  // Status
  const statusX =
    gradeX + cardW + cardGap;

  drawRoundedBox(
    doc,
    statusX,
    cardY,
    cardW,
    22,
    COLORS.cream2,
    status === 'PASS'
      ? COLORS.green
      : COLORS.red,
    1.5
  );

  setText(
    doc,
    status === 'PASS'
      ? COLORS.green
      : COLORS.red,
    5,
    'helvetica',
    'bold'
  );

  doc.text(
    'FINAL STATUS',
    statusX + cardW / 2,
    cardY + 6,
    { align: 'center' }
  );

  setText(
    doc,
    status === 'PASS'
      ? COLORS.green
      : COLORS.red,
    10,
    'helvetica',
    'bold'
  );

  doc.text(
    status,
    statusX + cardW / 2,
    cardY + 16,
    { align: 'center' }
  );

  // ==========================================================
  // CLASSIFICATION
  // ==========================================================

  const classificationY =
    cardY + 27;

  drawRoundedBox(
    doc,
    rightX,
    classificationY,
    rightW,
    11,
    COLORS.cream2,
    COLORS.border,
    1.5
  );

  setText(
    doc,
    COLORS.gray,
    5.5,
    'helvetica',
    'bold'
  );

  doc.text(
    'CLASSIFICATION',
    rightX + 4,
    classificationY + 7
  );

  setText(
    doc,
    COLORS.navy,
    7,
    'helvetica',
    'bold'
  );

  doc.text(
    classification,
    rightX + 43,
    classificationY + 7
  );

  // ==========================================================
  // RESULT FOOTER
  // ==========================================================

  setText(
    doc,
    COLORS.gray2,
    4.5,
    'helvetica',
    'normal'
  );

  doc.text(
    'This document is electronically generated and is valid subject to institutional records.',
    rightX,
    195
  );

  setText(
    doc,
    COLORS.gold,
    5,
    'helvetica',
    'bold'
  );

  doc.text(
    'OFFICIAL ACADEMIC RECORD',
    rightX + rightW,
    195,
    { align: 'right' }
  );

  // ==========================================================
  // SAVE
  // ==========================================================

  const safeRoll =
    String(
      student.roll_number || 'STUDENT'
    ).replace(
      /[^a-zA-Z0-9_-]/g,
      '_'
    );

  doc.save(
    `Result_Certificate_${safeRoll}.pdf`
  );
}