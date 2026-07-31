"use client";
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { Course, SiteSettings } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/Toast';
import Base64Image from '@/components/Base64Image';

interface ContactViewProps { courses: Course[]; settings: SiteSettings; }

export const ContactView: React.FC<ContactViewProps> = ({ courses, settings }) => {
  const { showToast } = useToast();
  const supabase = createClient();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', course: 'General Inquiry', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCourses = courses.filter(c => c.is_active);

  const validate = () => {
    const temp: Record<string, string> = {};
    if (!formData.name.trim()) temp.name = 'Name is required';
    if (!formData.phone.trim()) temp.phone = 'Phone is required';
    else if (!/^[0-9\s+-]{10,15}$/.test(formData.phone.trim().replace(/\s/g,''))) temp.phone = 'Invalid phone number';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) temp.email = 'Invalid email';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.from('enquiries').insert({
      id: `enq-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      course: formData.course,
      message: formData.message.trim() || 'General inquiry via Contact Form.',
      status: 'new',
      replied: false,
      admission_ok: false,
      fee_paid: false,
      created_at: new Date().toISOString()
    });
    setSubmitting(false);
    if (error) {
      showToast('Submission failed. Please try again.', 'error');
    } else {
      setSubmitted(true);
      showToast('Thank you! Our team will contact you soon.', 'success');
      setFormData({ name: '', phone: '', email: '', course: 'General Inquiry', message: '' });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md mx-auto space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-extrabold font-heading text-accent">Message Sent!</h2>
          <p className="text-gray-600">We will get back to you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Contact Us</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent">Get in Touch With Us</h1>
        <p className="text-gray-500 text-sm">Have questions? Drop us a line or visit our campus.</p>
      </section>

      {settings.contact_image && (
        <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden border shadow-sm relative">
          <Base64Image base64={settings.contact_image} alt="Contact Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <span className="text-white font-heading font-extrabold text-lg md:text-2xl">Direct Contact & Admissions Desk</span>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6 text-left">
          <InfoCard icon={MapPin} title="Academy Campus" content={settings.contact_address} />
          <InfoCard icon={Phone} title="Call Support Numbers">
            <a href={`tel:${settings.contact_phone_1}`} className="hover:text-primary block">{settings.contact_phone_1} (Main)</a>
            {settings.contact_phone_2 && <a href={`tel:${settings.contact_phone_2}`} className="hover:text-primary block mt-1">{settings.contact_phone_2} (Admissions)</a>}
          </InfoCard>
          <InfoCard icon={Mail} title="Email Communication">
            <a href={`mailto:${settings.contact_email}`} className="hover:text-primary break-all">{settings.contact_email}</a>
          </InfoCard>
          <InfoCard icon={Clock} title="Campus Timings" content={settings.contact_working_hours} />
        </div>

        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border shadow-md">
          <div className="mb-6 text-left">
            <h3 className="text-lg font-bold text-gray-900 font-heading">Send an Instant Message</h3>
            <p className="text-gray-500 text-xs mt-1">Fill the form and our counselors will respond within 24 hours.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={errors.name} />
              <InputField label="Phone Number *" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} error={errors.phone} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Email (Optional)" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} error={errors.email} />
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">Program of Interest</label>
                <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25">
                  <option value="General Inquiry">General Inquiry</option>
                  {activeCourses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">Your Message</label>
              <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2">
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-4.5 h-4.5 text-secondary" /> Submit Message</>}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

/* Helper components */
const InfoCard: React.FC<{ icon: any; title: string; content?: string; children?: React.ReactNode }> = ({ icon: Icon, title, content, children }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm flex gap-4">
    <div className="w-10 h-10 rounded-xl bg-cream text-primary flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-gray-900 font-heading">{title}</h4>
      {content && <p className="text-gray-500 text-xs leading-relaxed">{content}</p>}
      {children}
    </div>
  </div>
);

const InputField: React.FC<{ label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string }> = ({ label, type = 'text', value, onChange, error }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">{label}</label>
    <input type={type} required value={value} onChange={onChange} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 ${error ? 'border-rose-300' : 'border-gray-200'}`} />
    {error && <p className="text-rose-600 text-[10px] mt-1">{error}</p>}
  </div>
);