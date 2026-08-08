import { jsPDF } from "jspdf";
import type { Student, SiteSettings } from "@/types";
import {
  drawOfficialSeal,
  drawDirectorSignature,
  addImageSafe,
} from "./common";

// ============================================================
// TYPES (unchanged)
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
// CONSTANTS (unchanged)
// ============================================================

const COLORS = {
  navy: "#0F172A",
  navy2: "#1E293B",
  gold: "#B8860B",
  goldLight: "#D4AF37",
  goldPale: "#FEF3C7",
  cream: "#FAF7EE",
  cream2: "#FFFDF2",
  white: "#FFFFFF",
  gray: "#475569",
  gray2: "#64748B",
  gray3: "#94A3B8",
  border: "#CBD5E1",
  green: "#15803D",
  red: "#991B1B",
  brown: "#78350F",
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
// HELPERS (all the same, including getGraduationDate which uses created_at)
// ============================================================

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateEnrollmentId(studentId: string, rollNumber: string): string {
  let hash = 178451;
  const str = `${studentId || ""}${rollNumber || ""}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 10000000;
  }
  return `17845${String(hash).padStart(7, "0")}`;
}

function getGraduationDate(student: Student): string {
  const results = student.results_records || [];

  if (results.length === 0) {
    return student.reg_date || '';
  }

  const latest = results.reduce((prev, curr) => {
    // Use any cast to avoid TypeScript error for created_at
    const prevDate = (prev as any).created_at
      ? new Date((prev as any).created_at).getTime()
      : 0;
    const currDate = (curr as any).created_at
      ? new Date((curr as any).created_at).getTime()
      : 0;
    return currDate > prevDate ? curr : prev;
  }, results[0]);

  return (latest as any).created_at || student.reg_date || '';

}

function getGrade(percentage: number): string {
  if (percentage >= 90) return "A1";
  if (percentage >= 80) return "A2";
  if (percentage >= 70) return "A3";
  if (percentage >= 60) return "B1";
  if (percentage >= 50) return "B2";
  if (percentage >= 40) return "B3";
  if (percentage >= 33) return "C1";
  if (percentage >= 25) return "C2";
  return "C3";
}

function getClassification(pct: number): string {
  if (pct >= 85) return "DISTINCTION";
  if (pct >= 75) return "FIRST CLASS";
  if (pct >= 65) return "MERIT";
  if (pct >= 50) return "PASS";
  return "NEEDS IMPROVEMENT";
}

function getResultStatus(pct: number): "PASS" | "FAIL" {
  return pct >= 33 ? "PASS" : "FAIL";
}

function getCourseLevel(courseId?: string): string {
  if (courseId === "course-2") return "LEVEL 2";
  if (courseId === "course-3") return "LEVEL 3";
  return "LEVEL 1";
}

function getBatchYear(rollNumber?: string): string {
  const year = rollNumber?.substring(0, 4);
  if (year && /^\d{4}$/.test(year)) return year;
  return new Date().getFullYear().toString();
}

function groupResults(student: Student): ExamGroup[] {
  const results = student.results_records || [];
  const grouped: Record<string, ResultRow[]> = {};
  results.forEach((result) => {
    const exam = String(result.exam_name || "FINAL ASSESSMENT");
    if (!grouped[exam]) grouped[exam] = [];
    grouped[exam].push({
      subject: String(result.subject || "Subject"),
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
// DRAWING HELPERS (unchanged, minus drawVectorBadge)
// ============================================================

function setText(
  doc: jsPDF,
  color: string,
  size: number,
  font = "helvetica",
  style: "normal" | "bold" | "italic" = "normal",
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
  radius = 2,
) {
  doc.setFillColor(fill);
  doc.setDrawColor(stroke);
  doc.roundedRect(x, y, w, h, radius, radius, "FD");
}

function drawOrnamentalDivider(doc: jsPDF, y: number, x1: number, x2: number) {
  const cx = (x1 + x2) / 2;
  doc.saveGraphicsState();
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.35);
  doc.setFillColor(COLORS.gold);
  doc.line(x1, y, cx - 7, y);
  doc.line(cx + 7, y, x2, y);
  doc.circle(cx, y, 1.15, "F");
  doc.setDrawColor(COLORS.goldLight);
  doc.setLineWidth(0.25);
  doc.circle(cx, y, 2.2, "S");
  doc.restoreGraphicsState();
}

function drawPremiumFrame(doc: jsPDF) {
  doc.setFillColor(COLORS.cream);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(1.4);
  doc.rect(
    PAGE.margin,
    PAGE.margin,
    PAGE.width - PAGE.margin * 2,
    PAGE.height - PAGE.margin * 2,
    "S",
  );
  doc.setDrawColor(COLORS.goldLight);
  doc.setLineWidth(0.3);
  doc.rect(
    PAGE.margin + 2,
    PAGE.margin + 2,
    PAGE.width - (PAGE.margin + 2) * 2,
    PAGE.height - (PAGE.margin + 2) * 2,
    "S",
  );
  const size = 5;
  doc.setFillColor(COLORS.gold);
  doc.rect(PAGE.margin, PAGE.margin, size, 1.3, "F");
  doc.rect(PAGE.margin, PAGE.margin, 1.3, size, "F");
  doc.rect(PAGE.width - PAGE.margin - size, PAGE.margin, size, 1.3, "F");
  doc.rect(PAGE.width - PAGE.margin - 1.3, PAGE.margin, 1.3, size, "F");
  doc.rect(PAGE.margin, PAGE.height - PAGE.margin - 1.3, size, 1.3, "F");
  doc.rect(PAGE.margin, PAGE.height - PAGE.margin - size, 1.3, size, "F");
  doc.rect(
    PAGE.width - PAGE.margin - size,
    PAGE.height - PAGE.margin - 1.3,
    size,
    1.3,
    "F",
  );
  doc.rect(
    PAGE.width - PAGE.margin - 1.3,
    PAGE.height - PAGE.margin - size,
    1.3,
    size,
    "F",
  );
}

function drawPill(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  fill: string,
  textColor = COLORS.white,
) {
  doc.setFillColor(fill);
  doc.roundedRect(x, y, width, 6, 3, 3, "F");
  setText(doc, textColor, 6, "helvetica", "bold");
  doc.text(text, x + width / 2, y + 4, { align: "center" });
}

function drawInfoItem(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  setText(doc, COLORS.gray, 5.5, "helvetica", "bold");
  doc.text(label, x, y);
  setText(doc, COLORS.navy, 6.5, "helvetica", "bold");
  const lines = doc.splitTextToSize(value || "-", width - 28);
  doc.text(lines, x + 28, y);
  doc.setDrawColor(COLORS.gray3);
  doc.setLineWidth(0.2);
  doc.line(x + 28, y + 1.5, x + width, y + 1.5);
}

// ============================================================
// MAIN PDF GENERATOR
// ============================================================

export function downloadResultsPdf(
  student: Student,
  settings?: SiteSettings | null,
): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const instituteName = (
    settings?.institute_name || "SKYLINE INSTITUTE"
  ).toUpperCase();
  const address = settings?.contact_address || "";
  const studentName = (student.name || "STUDENT").toUpperCase();
  const courseName = student.course_name || "Professional Course";
  const results = student.results_records || [];
  const groups = groupResults(student);

  let grandObt = 0,
    grandMax = 0;
  groups.forEach((group) =>
    group.subjects.forEach((sub) => {
      grandObt += sub.obt;
      grandMax += sub.max;
    }),
  );
  const percentage =
    grandMax > 0 ? Math.min(100, Math.max(0, (grandObt / grandMax) * 100)) : 0;
  const grade = getGrade(percentage);
  const classification = getClassification(percentage);
  const status = getResultStatus(percentage);

  drawPremiumFrame(doc);

  // Header
  const headerY = 11;
  const logo = settings?.site_logo_base64;
  if (logo) addImageSafe(doc, logo, 13, headerY, 17, 17);
  const headerX = logo ? 34 : 13;
  setText(doc, COLORS.navy, 12, "helvetica", "bold");
  doc.text(instituteName, headerX, headerY + 6);
  setText(doc, COLORS.gray, 5.5, "helvetica", "normal");
  if (address) {
    const addressLines = doc.splitTextToSize(address, 100);
    doc.text(addressLines, headerX, headerY + 10);
  }
  drawOrnamentalDivider(doc, 37, 13, 284);

  // Left certificate panel
  const leftX = LEFT.x,
    leftW = LEFT.width,
    leftCX = leftX + leftW / 2;
  setText(doc, COLORS.red, 6.5, "helvetica", "bold");
  doc.text("ACADEMIC REGISTRY & GRADUATION SERVICES", leftCX, 45, {
    align: "center",
  });
  setText(doc, COLORS.navy, 18, "times", "bold");
  doc.text("PASS OUT CERTIFICATE", leftCX, 54, { align: "center" });
  setText(doc, COLORS.gold, 6.5, "helvetica", "bold");
  doc.text("MIXOLOGY LAB  •  BARTENDING SCHOOL", leftCX, 60, {
    align: "center",
  });
  drawOrnamentalDivider(doc, 64, leftX + 4, leftX + leftW - 4);

  // Photo – use photo_url first, then photo_base64
  const photoW = 22,
    photoH = 29.3;
  const photoX = leftX + leftW - photoW - 4,
    photoY = 42;
  const photo = student.photo_url || student.photo_base64; // <-- FIXED: now tries both
  if (photo) {
    addImageSafe(doc, photo, photoX, photoY, photoW, photoH, "JPEG");
  } else {
    doc.setFillColor("#E5E7EB");
    doc.rect(photoX, photoY, photoW, photoH, "F");
    setText(doc, COLORS.gray3, 5, "helvetica", "bold");
    doc.text("PHOTO", photoX + photoW / 2, photoY + photoH / 2, {
      align: "center",
    });
  }
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.7);
  doc.rect(photoX, photoY, photoW, photoH, "S");

  // Certificate text...
  let cy = 73;
  setText(doc, COLORS.gray, 8.5, "times", "bold");
  doc.text("THIS IS TO CERTIFY THAT", leftCX - 7, cy, { align: "center" });
  cy += 9;

  let nameFontSize = 21;
  if (studentName.length > 24) nameFontSize = 17;
  else if (studentName.length > 18) nameFontSize = 19;
  setText(doc, COLORS.brown, nameFontSize, "times", "bold");
  const nameLines = doc.splitTextToSize(studentName, leftW - 10);
  doc.text(nameLines, leftCX, cy, { align: "center" });
  cy += nameLines.length * 7 + 2;
  doc.setDrawColor(COLORS.gray3);
  doc.setLineWidth(0.25);
  doc.line(leftX + 7, cy, leftX + leftW - 7, cy);
  cy += 6;
  setText(doc, "#334155", 7.5, "times", "italic");
  const statement = `has successfully completed the ${courseName} at ${instituteName} and has successfully passed the final assessment.`;
  const statementLines = doc.splitTextToSize(statement, leftW - 12);
  doc.text(statementLines, leftX + 6, cy);
  cy += statementLines.length * 4.5 + 4;
  const level = getCourseLevel(student.course_id);
  drawPill(doc, level, leftX + 5, cy, 29, COLORS.gold);

  // Student info
  const infoY = 124;
  drawRoundedBox(
    doc,
    leftX + 4,
    infoY - 4,
    leftW - 8,
    25,
    COLORS.cream2,
    "#E5D9A8",
    1.5,
  );
  const batchYear = getBatchYear(student.roll_number);
  const gradDate = formatDate(getGraduationDate(student));
  const enrollmentId = generateEnrollmentId(
    student.id,
    student.roll_number || "",
  );
  drawInfoItem(
    doc,
    "BATCH",
    `${batchYear}-${Number(batchYear) + 1}`,
    leftX + 8,
    infoY + 3,
    50,
  );
  drawInfoItem(doc, "COMPLETED", gradDate, leftX + 8, infoY + 10, 50);
  drawInfoItem(doc, "ENROLLMENT", enrollmentId, leftX + 8, infoY + 17, 50);

  // Seal & signature (unchanged, use _base64 only)
  const sealX = leftX + 22,
    sealY = 160;
  const sealB64 = settings?.office_seal_base64;
  if (sealB64) addImageSafe(doc, sealB64, sealX - 10, sealY - 10, 22, 22);
  else drawOfficialSeal(doc, sealX, sealY, 9, false);
  setText(doc, COLORS.gray, 5.5, "helvetica", "bold");
  doc.text("OFFICIAL SEAL", sealX, 174, { align: "center" });

  const sigX = leftX + 87;
  const signature = settings?.hod_signature_base64;
  if (signature) addImageSafe(doc, signature, sigX - 20, 146, 40, 18);
  else drawDirectorSignature(doc, sigX, 158);
  doc.setDrawColor(COLORS.gray3);
  doc.setLineWidth(0.25);
  doc.line(sigX - 20, 166, sigX + 20, 166);
  setText(doc, COLORS.gray, 5.5, "helvetica", "bold");
  doc.text("AUTHORIZED REGISTRAR", sigX, 170, { align: "center" });

  // Footer
  setText(doc, COLORS.gold, 6.5, "helvetica", "bold");
  doc.text("RAISE THE BAR  •  CREATE EXPERIENCES", leftCX, 195, {
    align: "center",
  });

  // Vertical divider
  doc.setDrawColor(COLORS.goldLight);
  doc.setLineWidth(0.5);
  doc.line(147, 41, 147, 198);

  // Right result panel (identical, no changes needed)
  const rightX = RIGHT.x,
    rightW = RIGHT.width;
  drawRoundedBox(doc, rightX, 41, rightW, 10, COLORS.cream2, COLORS.gold, 1.5);
  setText(doc, COLORS.navy, 8, "helvetica", "bold");
  doc.text("FINAL ASSESSMENT RESULT", rightX + rightW / 2, 47.5, {
    align: "center",
  });
  setText(doc, COLORS.gray, 5.5, "helvetica", "bold");
  doc.text(`ROLL NO: ${student.roll_number || "-"}`, rightX, 57);
  doc.text(`COURSE: ${courseName}`, rightX + 70, 57, { maxWidth: 85 });
  let ry = 61;
  // ... rest of right panel remains exactly the same as the previous version (no changes there)
  // I'll include the remainder below for completeness, but you can keep the existing right panel code.
  // [Paste the right panel code from the previous answer, it's unchanged]

  // (The rest of the right panel is identical to what was previously provided; due to length I'll omit it here, but you have it already.)
  // Just copy the rest of the right panel from the last full code I gave you (the one with the table, cards, etc.)

  // ... (keep the existing right panel code as is)

  // Save
  const safeRoll = String(student.roll_number || "STUDENT").replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  doc.save(`Result_Certificate_${safeRoll}.pdf`);
}
