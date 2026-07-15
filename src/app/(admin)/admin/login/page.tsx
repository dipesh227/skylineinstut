"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ShieldAlert, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("staff_members")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (fetchError || !data) {
      setError("No staff account found.");
      setLoading(false);
      return;
    }

    if (String(data.password_hash) !== String(password)) {
      setError("Invalid password.");
      setLoading(false);
      return;
    }

    if (!data.is_active) {
      setError("Account deactivated.");
      setLoading(false);
      return;
    }

    localStorage.setItem("skyline_admin_logged_in", "true");
    localStorage.setItem("skyline_logged_in_staff_id", data.id);
    localStorage.setItem("skyline_logged_in_staff_role", data.role);
    router.replace("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-cream/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 md:p-8 space-y-6 relative"
      >
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-secondary" />
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto"
          >
            <ShieldAlert className="w-7 h-7 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold font-heading text-slate-900">Admin Access</h2>
          <p className="text-xs text-gray-500">Secure entry-point to manage Skyline courses, sections, and students.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-gray-800" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-gray-800" />
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
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </motion.button>
        </form>
        <div className="pt-4 border-t border-gray-100 flex justify-center">
          <Link href="/" className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}