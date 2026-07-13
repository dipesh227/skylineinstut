"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle } from "lucide-react";

export default function EnquiryPage() {
  const searchParams = useSearchParams();
  const preselectedCourse = searchParams.get("course") || "";
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    course: preselectedCourse,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.course) {
      setError("Name, phone, and course are required.");
      return;
    }
    setLoading(true);
    const { error: insertError } = await supabase.from("enquiries").insert({
      id: `enq-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      course: form.course,
      message: form.message.trim(),
      status: "new",
      replied: false,
      admission_ok: false,
      fee_paid: false,
      created_at: new Date().toISOString(),
    });
    if (insertError) {
      setError("Failed to submit. Please try again.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream/20">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md mx-auto space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-extrabold font-heading text-accent">Enquiry Submitted!</h2>
          <p className="text-gray-600">We will get back to you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 space-y-3">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Admissions</span>
        <h1 className="text-3xl font-extrabold font-heading text-accent">Enquire Now</h1>
        <p className="text-gray-500 text-sm">Fill the form and our counsellors will contact you.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Full Name *</label>
          <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number *</label>
          <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Course of Interest *</label>
          <input type="text" required value={form.course} onChange={e => setForm({...form, course: e.target.value})} placeholder="e.g., Professional Bartending & Mixology" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Message</label>
          <textarea rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        {error && <p className="text-rose-600 text-xs font-semibold">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
          {loading ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Enquiry</>}
        </button>
      </form>
    </div>
  );
}