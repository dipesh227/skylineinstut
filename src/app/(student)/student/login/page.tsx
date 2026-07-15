"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, ArrowRight, Mail, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function StudentLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const clean = identifier.trim().toLowerCase();
    if (!clean) return;
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("students")
      .select("*")
      .or(`email.ilike."${clean}",roll_number.ilike."${clean}"`)
      .single();

    if (fetchError || !data) {
      setError("No student found with that Email or Roll Number.");
      setLoading(false);
      return;
    }

    localStorage.setItem("skyline_student_logged_in_id", data.id);
    router.replace("/student/dashboard");
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-primary/5 via-white to-cream/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 md:p-8 space-y-6 relative"
      >
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-secondary" />
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto"
          >
            <GraduationCap className="w-7 h-7 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold font-heading text-slate-900">Student Portal Entry</h2>
          <p className="text-xs text-gray-500">Access your digital student ID card & fee receipts.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Registered Email or Roll Number</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                placeholder="E.g., STL-2026-001 or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all text-gray-800"
              />
            </div>
          </div>
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all focus:outline-none disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </motion.button>
        </form>
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold">
          <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <Link href="/admin/login" className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors">
            <Shield className="w-3.5 h-3.5" /> Staff Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}