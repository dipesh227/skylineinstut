"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ChevronRight,
  Activity,
  WalletCards,
  IndianRupee,
  CreditCard,
  CircleDollarSign,
  RefreshCw,
  Search,
  UserPlus,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

import type { Enquiry, Course, Student } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

// ============================================================
// TYPES
// ============================================================

interface AdminDashboardTabProps {
  enquiries?: Enquiry[];
  courses?: Course[];
  onTabChange: (tabId: string) => void;
}

// ============================================================
// HELPERS
// ============================================================

function money(value: number): string {
  return `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isToday(value?: string | null): boolean {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isActiveStudent(validTill?: string | null): boolean {
  if (!validTill) return true;

  const date = new Date(validTill);

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  enquiries: enquiriesProp = [],
  courses: coursesProp = [],
  onTabChange,
}) => {
  const supabase = createClient();

  // ==========================================================
  // STATE
  // ==========================================================

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchDue, setSearchDue] = useState("");

  const enquiries = Array.isArray(enquiriesProp) ? enquiriesProp : [];

  const courses = Array.isArray(coursesProp) ? coursesProp : [];

  // ==========================================================
  // LOAD STUDENTS DIRECTLY FROM SUPABASE
  // ==========================================================

  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      setStudentError(null);

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("reg_date", {
          ascending: false,
        });

      if (error) {
        console.error("Student dashboard fetch error:", error);

        setStudentError(error.message || "Unable to load student data.");

        setStudents([]);
        return;
      }

      setStudents(Array.isArray(data) ? (data as Student[]) : []);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Student dashboard error:", error);

      setStudentError("Unable to load student data.");

      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // ==========================================================
  // STUDENT ANALYTICS
  // ==========================================================

  const analytics = useMemo(() => {
    const totalStudents = students.length;

    const todayStudents = students.filter((student) =>
      isToday(student.reg_date),
    ).length;

    const activeStudents = students.filter((student) =>
      isActiveStudent(student.valid_till),
    ).length;

    const expiredStudents = Math.max(totalStudents - activeStudents, 0);

    // --------------------------------------------------------
    // DIRECTLY FROM students TABLE
    // --------------------------------------------------------

    const totalCourseFee = students.reduce(
      (sum, student) => sum + Number(student.fee_amount || 0),
      0,
    );

    const totalFeeCollected = students.reduce(
      (sum, student) => sum + Number(student.fee_paid || 0),
      0,
    );

    const totalAmountDue = students.reduce(
      (sum, student) => sum + Number(student.fee_balance || 0),
      0,
    );

    const fullyPaidStudents = students.filter(
      (student) =>
        Number(student.fee_amount || 0) > 0 &&
        Number(student.fee_balance || 0) <= 0,
    ).length;

    const partialPaidStudents = students.filter((student) => {
      const total = Number(student.fee_amount || 0);

      const paid = Number(student.fee_paid || 0);

      const due = Number(student.fee_balance || 0);

      return total > 0 && paid > 0 && due > 0;
    }).length;

    const unpaidStudents = students.filter(
      (student) => Number(student.fee_paid || 0) <= 0,
    ).length;

    const studentsWithDue = students.filter(
      (student) => Number(student.fee_balance || 0) > 0,
    ).length;

    const collectionPercentage =
      totalCourseFee > 0
        ? Math.min(100, (totalFeeCollected / totalCourseFee) * 100)
        : 0;

    return {
      totalStudents,
      todayStudents,
      activeStudents,
      expiredStudents,
      totalCourseFee,
      totalFeeCollected,
      totalAmountDue,
      fullyPaidStudents,
      partialPaidStudents,
      unpaidStudents,
      studentsWithDue,
      collectionPercentage,
    };
  }, [students]);

  // ==========================================================
  // ENQUIRY ANALYTICS
  // ==========================================================

  const enquiryAnalytics = useMemo(() => {
    const totalEnquiries = enquiries.length;

    const todaysEnquiries = enquiries.filter((enquiry) =>
      isToday(enquiry.created_at),
    ).length;

    const confirmedAdmissions = enquiries.filter(
      (enquiry) => enquiry.admission_ok,
    ).length;

    const pendingReplies = enquiries.filter(
      (enquiry) => !enquiry.replied,
    ).length;

    const repliedEnquiries = totalEnquiries - pendingReplies;

    const conversionRate =
      totalEnquiries > 0
        ? ((confirmedAdmissions / totalEnquiries) * 100).toFixed(1)
        : "0.0";

    const responseRate =
      totalEnquiries > 0
        ? ((repliedEnquiries / totalEnquiries) * 100).toFixed(1)
        : "0.0";

    return {
      totalEnquiries,
      todaysEnquiries,
      confirmedAdmissions,
      pendingReplies,
      repliedEnquiries,
      conversionRate,
      responseRate,
    };
  }, [enquiries]);

  // ==========================================================
  // COURSE-WISE STUDENT + FEE ANALYTICS
  // ==========================================================

  const courseStats = useMemo(() => {
    return courses
      .map((course) => {
        const courseStudents = students.filter(
          (student) => student.course_id === course.id,
        );

        const courseEnquiries = enquiries.filter(
          (enquiry) => enquiry.course === course.id,
        );

        const totalFee = courseStudents.reduce(
          (sum, student) => sum + Number(student.fee_amount || 0),
          0,
        );

        const collected = courseStudents.reduce(
          (sum, student) => sum + Number(student.fee_paid || 0),
          0,
        );

        const due = courseStudents.reduce(
          (sum, student) => sum + Number(student.fee_balance || 0),
          0,
        );

        return {
          id: course.id,
          name: course.title || "Unnamed Course",
          students: courseStudents.length,
          enquiries: courseEnquiries.length,
          totalFee,
          collected,
          due,
        };
      })
      .sort((a, b) => b.students - a.students);
  }, [courses, students, enquiries]);

  // ==========================================================
  // RECENT STUDENTS
  // ==========================================================

  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => {
        const aTime = new Date(String(a.reg_date || 0)).getTime();

        const bTime = new Date(String(b.reg_date || 0)).getTime();

        return bTime - aTime;
      })
      .slice(0, 6);
  }, [students]);

  // ==========================================================
  // DUE STUDENTS
  // ==========================================================

  const dueStudents = useMemo(() => {
    const filtered = students.filter(
      (student) =>
        Number(student.fee_balance || 0) > 0 &&
        (!searchDue.trim() ||
          student.name?.toLowerCase().includes(searchDue.toLowerCase()) ||
          student.roll_number
            ?.toLowerCase()
            .includes(searchDue.toLowerCase()) ||
          student.course_name?.toLowerCase().includes(searchDue.toLowerCase())),
    );

    return filtered
      .sort((a, b) => Number(b.fee_balance || 0) - Number(a.fee_balance || 0))
      .slice(0, 6);
  }, [students, searchDue]);

  // ==========================================================
  // STAT CARD
  // ==========================================================

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    iconColor,
    onClick,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={[
        "bg-white",
        "rounded-2xl",
        "border border-slate-200",
        "p-4",
        "shadow-sm",
        onClick
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {onClick && <ChevronRight size={15} className="text-slate-300" />}
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </p>

        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>

        <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );

  // ==========================================================
  // PAYMENT BADGE
  // ==========================================================

  const PaymentBadge = ({ student }: { student: Student }) => {
    const total = Number(student.fee_amount || 0);

    const paid = Number(student.fee_paid || 0);

    const due = Number(student.fee_balance || 0);

    if (total > 0 && due <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-bold">
          <CheckCircle2 size={10} />
          PAID
        </span>
      );
    }

    if (paid > 0 && due > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-[9px] font-bold">
          <Clock size={10} />
          PARTIAL
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-700 text-[9px] font-bold">
        <AlertCircle size={10} />
        UNPAID
      </span>
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingStudents) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-52 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-72 bg-slate-100 rounded mt-2 animate-pulse" />
          </div>

          <div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 p-4 h-36 animate-pulse"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
              <div className="h-3 w-20 bg-slate-100 rounded mt-5" />
              <div className="h-7 w-24 bg-slate-200 rounded mt-2" />
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl h-72 animate-pulse" />
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-5">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />

            <h2 className="text-xl font-bold text-slate-900">
              Institute Dashboard
            </h2>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Students, fee collection, outstanding dues, admissions and institute
            performance.
          </p>

          {lastUpdated && (
            <p className="text-[9px] text-slate-400 mt-1">
              Student data updated at{" "}
              {lastUpdated.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-bold text-emerald-700">
                STUDENT DATA LIVE
              </span>
            </div>
          </div>

          <button
            onClick={loadStudents}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 text-[10px] font-bold"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {studentError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-600" />
            </div>

            <div>
              <p className="text-xs font-bold text-red-800">
                Student data could not be loaded
              </p>

              <p className="text-[10px] text-red-600 mt-1">{studentError}</p>
            </div>
          </div>

          <button
            onClick={loadStudents}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          CURRENT STUDENTS
      ====================================================== */}

      <section>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} className="text-primary" />

          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Current Student Overview
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            title="Current Students"
            value={analytics.totalStudents}
            subtitle={`${analytics.activeStudents} active • ${analytics.expiredStudents} expired`}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            onClick={() => onTabChange("students")}
          />

          <StatCard
            title="Total Course Fee"
            value={money(analytics.totalCourseFee)}
            subtitle="Total fee assigned"
            icon={CircleDollarSign}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />

          <StatCard
            title="Fee Collected"
            value={money(analytics.totalFeeCollected)}
            subtitle={`${analytics.collectionPercentage.toFixed(1)}% collected`}
            icon={IndianRupee}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />

          <StatCard
            title="Amount Due"
            value={money(analytics.totalAmountDue)}
            subtitle={`${analytics.studentsWithDue} students pending`}
            icon={WalletCards}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />

          <StatCard
            title="Fully Paid"
            value={analytics.fullyPaidStudents}
            subtitle={`${analytics.partialPaidStudents} partial • ${analytics.unpaidStudents} unpaid`}
            icon={ShieldCheck}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>
      </section>

      {/* ======================================================
          TODAY / ADMISSION SNAPSHOT
      ====================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <UserPlus size={19} className="text-blue-600" />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                New Students Today
              </p>

              <p className="text-xl font-bold text-slate-900 mt-1">
                {analytics.todayStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={19} className="text-emerald-600" />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                Fully Paid Students
              </p>

              <p className="text-xl font-bold text-slate-900 mt-1">
                {analytics.fullyPaidStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock size={19} className="text-amber-600" />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                Partial Payments
              </p>

              <p className="text-xl font-bold text-slate-900 mt-1">
                {analytics.partialPaidStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={19} className="text-red-600" />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                Students With Due
              </p>

              <p className="text-xl font-bold text-slate-900 mt-1">
                {analytics.studentsWithDue}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FEE COLLECTION
      ====================================================== */}

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fee Collection Overview
            </h3>

            <p className="text-[10px] text-slate-400 mt-1">
              Directly calculated from students table
            </p>
          </div>

          <CreditCard size={19} className="text-primary" />
        </div>

        {/* MAIN MONEY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-violet-600">
                  Total Course Fee
                </p>

                <p className="text-2xl font-bold text-violet-900 mt-2">
                  {money(analytics.totalCourseFee)}
                </p>
              </div>

              <CircleDollarSign size={27} className="text-violet-500" />
            </div>

            <p className="text-[10px] text-violet-500 mt-3">
              From {analytics.totalStudents} students
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-600">
                  Collected Amount
                </p>

                <p className="text-2xl font-bold text-emerald-900 mt-2">
                  {money(analytics.totalFeeCollected)}
                </p>
              </div>

              <IndianRupee size={27} className="text-emerald-500" />
            </div>

            <p className="text-[10px] text-emerald-600 mt-3">
              {analytics.collectionPercentage.toFixed(1)}% of total fee
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-red-600">
                  Outstanding Due
                </p>

                <p className="text-2xl font-bold text-red-900 mt-2">
                  {money(analytics.totalAmountDue)}
                </p>
              </div>

              <WalletCards size={27} className="text-red-500" />
            </div>

            <p className="text-[10px] text-red-600 mt-3">
              Across {analytics.studentsWithDue} students
            </p>
          </div>
        </div>

        {/* COLLECTION BAR */}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-semibold text-slate-500">
              Overall Collection
            </span>

            <span className="text-xs font-bold text-slate-800">
              {analytics.collectionPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${analytics.collectionPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* PAYMENT BREAKDOWN */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="flex items-center justify-between border border-emerald-100 bg-emerald-50/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-emerald-600 font-semibold">
                FULLY PAID
              </p>

              <p className="text-xl font-bold text-emerald-800 mt-1">
                {analytics.fullyPaidStudents}
              </p>
            </div>

            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>

          <div className="flex items-center justify-between border border-amber-100 bg-amber-50/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-amber-600 font-semibold">
                PARTIAL PAID
              </p>

              <p className="text-xl font-bold text-amber-800 mt-1">
                {analytics.partialPaidStudents}
              </p>
            </div>

            <Clock size={20} className="text-amber-500" />
          </div>

          <div className="flex items-center justify-between border border-red-100 bg-red-50/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-red-600 font-semibold">UNPAID</p>

              <p className="text-xl font-bold text-red-800 mt-1">
                {analytics.unpaidStudents}
              </p>
            </div>

            <AlertCircle size={20} className="text-red-500" />
          </div>
        </div>
      </section>

      {/* ======================================================
          ENQUIRY OVERVIEW
      ====================================================== */}

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-primary" />

          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Admission & Lead Overview
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            title="Total Leads"
            value={enquiryAnalytics.totalEnquiries}
            subtitle="All enquiries"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            onClick={() => onTabChange("enquiries")}
          />

          <StatCard
            title="Today's Leads"
            value={enquiryAnalytics.todaysEnquiries}
            subtitle="Received today"
            icon={Calendar}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />

          <StatCard
            title="Pending Reply"
            value={enquiryAnalytics.pendingReplies}
            subtitle="Needs follow-up"
            icon={MessageSquare}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />

          <StatCard
            title="Admissions"
            value={enquiryAnalytics.confirmedAdmissions}
            subtitle={`${enquiryAnalytics.conversionRate}% conversion`}
            icon={UserCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />

          <StatCard
            title="Response Rate"
            value={`${enquiryAnalytics.responseRate}%`}
            subtitle="Leads contacted"
            icon={MessageSquare}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>
      </section>

      {/* ======================================================
          EXISTING CHARTS
      ====================================================== */}

      <DashboardCharts enquiries={enquiries} courses={courses} />

      {/* ======================================================
          COURSE PERFORMANCE
      ====================================================== */}

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Course Performance
            </h3>

            <p className="text-[10px] text-slate-400 mt-1">
              Student count, total fee, collected amount and due amount
            </p>
          </div>

          <Layers size={18} className="text-primary" />
        </div>

        {courseStats.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No course data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-[10px] font-bold text-slate-400 uppercase">
                    Course
                  </th>

                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase text-center">
                    Students
                  </th>

                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase text-right">
                    Total Fee
                  </th>

                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase text-right">
                    Collected
                  </th>

                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase text-right">
                    Due
                  </th>

                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase text-center">
                    Leads
                  </th>
                </tr>
              </thead>

              <tbody>
                {courseStats.slice(0, 10).map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen size={14} className="text-primary" />
                        </div>

                        <span className="text-xs font-semibold text-slate-700">
                          {course.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <span className="text-xs font-bold text-slate-800">
                        {course.students}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <span className="text-xs font-semibold text-violet-700">
                        {money(course.totalFee)}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <span className="text-xs font-semibold text-emerald-700">
                        {money(course.collected)}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <span className="text-xs font-semibold text-red-600">
                        {money(course.due)}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <span className="inline-flex px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {course.enquiries}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ======================================================
          RECENT STUDENTS + OUTSTANDING
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* RECENT STUDENTS */}

        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Students
              </h3>

              <p className="text-[10px] text-slate-400 mt-1">
                Latest registrations from students table
              </p>
            </div>

            <button
              onClick={() => onTabChange("students")}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No students found.
              </div>
            ) : (
              recentStudents.map((student) => (
                <div key={student.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {student.name?.charAt(0).toUpperCase() || "S"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {student.name}
                      </p>

                      <PaymentBadge student={student} />
                    </div>

                    <p className="text-[10px] text-slate-400 truncate mt-1">
                      {student.course_name}
                      {" • "}
                      {student.roll_number}
                    </p>

                    <p className="text-[9px] text-slate-400 mt-1">
                      Registered {formatDate(student.reg_date)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-semibold text-emerald-600">
                      Paid
                    </p>

                    <p className="text-xs font-bold text-slate-700">
                      {money(Number(student.fee_paid || 0))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* OUTSTANDING */}

        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Outstanding Fees
                </h3>

                <p className="text-[10px] text-slate-400 mt-1">
                  Students with highest pending balance
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700">
                <AlertCircle size={12} />

                <span className="text-[10px] font-bold">
                  {analytics.studentsWithDue} Pending
                </span>
              </div>
            </div>

            {/* SEARCH */}

            <div className="relative mt-4">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchDue}
                onChange={(e) => setSearchDue(e.target.value)}
                placeholder="Search student, roll no. or course..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {dueStudents.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={27} className="mx-auto text-emerald-500" />

                <p className="text-xs font-semibold text-slate-700 mt-2">
                  No outstanding fees
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  All student balances are clear.
                </p>
              </div>
            ) : (
              dueStudents.map((student) => (
                <div key={student.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <IndianRupee size={16} className="text-red-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {student.name}
                    </p>

                    <p className="text-[10px] text-slate-400 truncate mt-1">
                      {student.course_name}
                      {" • "}
                      {student.roll_number}
                    </p>

                    <p className="text-[9px] text-slate-400 mt-1">
                      Total fee: {money(Number(student.fee_amount || 0))}
                      {" • "}
                      Paid: {money(Number(student.fee_paid || 0))}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-red-600">
                      {money(Number(student.fee_balance || 0))}
                    </p>

                    <p className="text-[9px] text-red-400">Outstanding</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <section className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={17} className="text-primary" />

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Administrative Tasks
            </h4>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Common daily management actions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onTabChange("students")}
            className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Users size={14} />
            Manage Students
            <ArrowRight size={13} />
          </button>

          <button
            onClick={() => onTabChange("enquiries")}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-primary border border-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <MessageSquare size={14} />
            Manage Enquiries
            <ArrowRight size={13} />
          </button>

          <button
            onClick={() => onTabChange("courses")}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <BookOpen size={14} />
            Manage Courses
            <ArrowRight size={13} />
          </button>
        </div>
      </section>
    </div>
  );
};
