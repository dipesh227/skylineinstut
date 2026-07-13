"use client";
import React from 'react';
import { Users, UserCheck, Banknote, Calendar, Layers, ShieldCheck, ArrowRight, BookOpen, MessageSquare } from 'lucide-react';
import { Enquiry, Course } from '@/types';
import { DashboardCharts } from '@/components/admin/DashboardCharts';

interface AdminDashboardTabProps {
  enquiries: Enquiry[];
  courses: Course[];
  onTabChange: (tabId: string) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ enquiries, courses, onTabChange }) => {
  const totalEnquiries = enquiries.length;
  const today = new Date().toISOString().substring(0, 10);
  const todaysEnquiries = enquiries.filter(e => {
    try { return new Date(e.created_at).toISOString().substring(0, 10) === today; } catch { return false; }
  }).length;
  const confirmedAdmissions = enquiries.filter(e => e.admission_ok).length;
  const totalFeesCollected = enquiries.filter(e => e.fee_paid).reduce((sum, e) => sum + (e.fee_amount || 0), 0);
  const pendingReplies = enquiries.filter(e => !e.replied).length;

  return (
    <div className="space-y-8 text-left animate-slide-in">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-900">Institute Performance Analytics</h2>
        <p className="text-xs text-gray-500 mt-1">Real-time summaries of lead conversions, financial collections, and student placements.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Leads</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><MessageSquare className="w-4 h-4" /></div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-950 font-heading">{totalEnquiries}</span>
            <p className="text-[10px] text-gray-500 mt-1">Submitted applications</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today&apos;s Leads</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Calendar className="w-4 h-4" /></div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-950 font-heading">{todaysEnquiries}</span>
            <p className="text-[10px] text-gray-500 mt-1">In last 24 hours</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Reply</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Users className="w-4 h-4" /></div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-950 font-heading">{pendingReplies}</span>
            <p className="text-[10px] text-rose-600 mt-1 font-semibold">Requires follow-up</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admissions</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="w-4 h-4" /></div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-950 font-heading">{confirmedAdmissions}</span>
            <p className="text-[10px] text-gray-500 mt-1">Enrolled candidates</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Revenue</span>
            <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg"><Banknote className="w-4 h-4" /></div>
          </div>
          <div>
            <span className="text-lg md:text-xl font-extrabold text-slate-950 font-heading">₹{totalFeesCollected.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-gray-500 mt-1">Collections recorded</p>
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <DashboardCharts enquiries={enquiries} courses={courses} />

      <div className="bg-cream/40 p-5 rounded-2xl border border-cream/50">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Quick Administrative Tasks</h4>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onTabChange('enquiries')} className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
            Manage Pending Enquiries <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onTabChange('courses')} className="px-4 py-2 bg-white hover:bg-gray-50 text-primary border border-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
            Create a New Program <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};