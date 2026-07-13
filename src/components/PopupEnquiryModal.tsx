"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { X, Send, BookOpen, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Course } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'motion/react';

interface PopupEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  preselectedCourse?: string;
  onSuccess?: () => void;
}

export const PopupEnquiryModal: React.FC<PopupEnquiryModalProps> = ({
  isOpen,
  onClose,
  courses,
  preselectedCourse = '',
  onSuccess
}) => {
  const { showToast } = useToast();
  const supabase = createClient();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', course: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Memoize active courses so the reference stays stable
  const activeCourses = useMemo(() => courses.filter(c => c.is_active), [courses]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        course: preselectedCourse || (activeCourses.length > 0 ? activeCourses[0].title : ''),
        message: ''
      });
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen, preselectedCourse, activeCourses]);

  const validate = () => {
    const temp: Record<string, string> = {};
    if (!formData.name.trim()) temp.name = 'Full Name is required';
    if (!formData.phone.trim()) temp.phone = 'Phone number is required';
    else if (!/^[0-9\s+-]{10,15}$/.test(formData.phone.trim().replace(/\s/g, ''))) temp.phone = 'Please enter a valid phone number (10-15 digits)';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) temp.email = 'Please enter a valid email address';
    if (!formData.course) temp.course = 'Please select a course';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('enquiries').insert({
      id: `enq-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      course: formData.course,
      message: formData.message.trim() || `Interested in enrolling for ${formData.course}.`,
      status: 'new',
      replied: false,
      admission_ok: false,
      fee_paid: false,
      created_at: new Date().toISOString()
    });

    setIsSubmitting(false);

    if (error) {
      showToast('Submission failed. Please try again.', 'error');
    } else {
      showToast(`Thank you, ${formData.name}! Your enquiry has been submitted.`, 'success');
      if (onSuccess) onSuccess();
      setShowSuccess(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
          >
            <div className="bg-primary p-6 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold font-heading">Apply For Enrolment</h3>
                <p className="text-white/80 text-xs mt-1">Start your 5-star hospitality journey today</p>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <AnimatePresence mode="wait">
              {!showSuccess ? (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                  <InputField icon={User} label="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={errors.name} />
                  <InputField icon={Phone} label="Contact Phone Number" required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} error={errors.phone} />
                  <InputField icon={Mail} label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} error={errors.email} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary" /> Select Course *</label>
                    <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/25">
                      {activeCourses.map(c => <option key={c.id} value={c.title}>{c.title} ({c.duration})</option>)}
                      <option value="General Inquiry">General Hospitality Careers Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-primary" /> Your Message</label>
                    <textarea rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/25 resize-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-all">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-secondary hover:bg-secondary-light text-accent font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                      {isSubmitting ? <><div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Application</>}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-8 text-center flex flex-col items-center justify-center space-y-5">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10"><motion.path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 font-heading">Application Received!</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">Thank you, <span className="font-semibold text-gray-800">{formData.name}</span>. Our course supervisor will get in touch shortly.</p>
                  <button onClick={() => { setShowSuccess(false); onClose(); }} className="px-8 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm transition-all shadow-md">Done</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const InputField: React.FC<{ icon: any; label: string; required?: boolean; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string }> = ({ icon: Icon, label, required, type = 'text', value, onChange, error }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-primary" /> {label} {required && <span className="text-rose-500">*</span>}</label>
    <input type={type} required={required} value={value} onChange={onChange} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/25 outline-none transition-all ${error ? 'border-rose-300 bg-rose-50/20' : 'border-gray-200'}`} />
    {error && <p className="text-rose-600 text-xs mt-1">{error}</p>}
  </div>
);