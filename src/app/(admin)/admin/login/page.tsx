"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ShieldAlert, Mail, Lock } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-left">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-heading font-extrabold text-primary">Admin Access</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase block mb-1"><Mail className="w-3.5 h-3.5 inline mr-1" /> Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase block mb-1"><Lock className="w-3.5 h-3.5 inline mr-1" /> Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}