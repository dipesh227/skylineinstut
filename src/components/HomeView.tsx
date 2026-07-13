"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Users, GraduationCap, Sparkles, Star, ChevronLeft, ChevronRight, CheckCircle2, Flame, MapPin, Coffee, HelpCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Course, Testimonial, GalleryImage, SiteSettings } from '@/types';
import Base64Image from '@/components/Base64Image';

interface HomeViewProps {
  courses: Course[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
  settings: SiteSettings;
}

export const HomeView: React.FC<HomeViewProps> = ({ courses, testimonials, gallery, settings }) => {
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [stats, setStats] = useState({ students: 0, placements: 0, coaches: 0, years: 0 });
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    if (settings.popup_enabled) setShowWelcomePopup(true);
  }, [settings]);

  useEffect(() => {
    const duration = 1200, steps = 30, stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setStats({
        students: Math.min(Math.floor((2500 / steps) * step), 2500),
        placements: Math.min(Math.floor((100 / steps) * step), 100),
        coaches: Math.min(Math.floor((12 / steps) * step), 12),
        years: Math.min(Math.floor((8 / steps) * step), 8)
      });
      if (step >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, []);

  const activeTestimonials = testimonials.filter(t => t.is_active);
  const featuredCourses = courses.filter(c => c.is_active).slice(0, 3);

  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: (custom: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: custom * 0.12 } })
  };

  return (
    <div className="space-y-20 pt-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-cream/30 pt-12 md:pt-24 pb-20 overflow-hidden">
        {settings.hero_bg_image && <div className="absolute inset-0 bg-cover bg-center opacity-10 -z-10" style={{ backgroundImage: `url(${settings.hero_bg_image})` }} />}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-cream/20 rounded-l-[100px] hidden lg:block -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
              <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold tracking-wide"><Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />Accredited 5-Star Placement Guarantee Program</motion.div>
              <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-accent leading-[1.1] tracking-tight">{settings.hero_headline}</motion.h1>
              <motion.p custom={2} initial="hidden" animate="visible" variants={fadeInUp} className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl">{settings.hero_subtext}</motion.p>
              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Link href="/enquiry" className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">{settings.hero_cta_text} <ArrowRight className="w-4 h-4 text-secondary" /></Link>
                <Link href="/courses" className="px-8 py-4 bg-white hover:bg-gray-50 text-primary border border-gray-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">Browse Academy Courses</Link>
              </motion.div>
              <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 gap-y-3.5 gap-x-6 pt-4 border-t border-gray-100 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-secondary shrink-0" />100% Practical Labs</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-secondary shrink-0" />5-Star Hotel Placements</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-secondary shrink-0" />Lifetime Mentorship</div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 bg-secondary/10 rounded-3xl blur-2xl -z-10" />
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 transition-all aspect-square bg-gray-100">
                  {settings.hero_bg_image ? <Base64Image base64={settings.hero_bg_image} alt="Skyline training" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Hero Image</div>}
                </div>
                <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">100%</div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase">Job Track</p><p className="text-xs font-extrabold text-accent mt-1">Confirmed Placements</p></div>
                </motion.div>
                <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="absolute -top-6 -right-6 bg-white p-3.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary"><Trophy className="w-5 h-5" /></div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase">Accredited</p><p className="text-xs font-extrabold text-accent mt-0.5">Premium Academy</p></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-primary text-white rounded-3xl p-8 md:p-12 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          <div className="flex flex-col items-center justify-center p-4"><span className="text-3xl md:text-5xl font-extrabold font-heading text-secondary">{stats.students}+</span><span className="text-xs md:text-sm text-gray-300 font-medium tracking-wide mt-2 text-center uppercase">Graduates Trained</span></div>
          <div className="flex flex-col items-center justify-center p-4 pt-8 lg:pt-4"><span className="text-3xl md:text-5xl font-extrabold font-heading text-secondary">{stats.placements}%</span><span className="text-xs md:text-sm text-gray-300 font-medium tracking-wide mt-2 text-center uppercase">Placement Record</span></div>
          <div className="flex flex-col items-center justify-center p-4 pt-8 lg:pt-4"><span className="text-3xl md:text-5xl font-extrabold font-heading text-secondary">{stats.coaches}+</span><span className="text-xs md:text-sm text-gray-300 font-medium tracking-wide mt-2 text-center uppercase">Professional Coaches</span></div>
          <div className="flex flex-col items-center justify-center p-4 pt-8 lg:pt-4"><span className="text-3xl md:text-5xl font-extrabold font-heading text-secondary">{stats.years}+</span><span className="text-xs md:text-sm text-gray-300 font-medium tracking-wide mt-2 text-center uppercase">Years of Excellence</span></div>
        </motion.div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3"><span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Curriculum</span><h2 className="text-3xl md:text-4xl font-extrabold font-heading text-accent">Featured Academy Programs</h2><p className="text-gray-500 text-sm">Select a course to view deep curriculum modules and apply for direct enrollment classes.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course, idx) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }} className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group">
              <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                {course.thumbnail_url ? <Base64Image base64={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>}
                {course.badge && <span className="absolute top-4 left-4 bg-secondary text-accent text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">{course.badge}</span>}
                <span className="absolute bottom-4 right-4 bg-accent/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">{course.duration}</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5 text-left">
                <div className="space-y-2"><h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors font-heading">{course.title}</h3><p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{course.short_description}</p></div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div><span className="block text-[10px] font-bold text-gray-400 uppercase">Course Fee</span><span className="text-base font-extrabold text-accent mt-1 block">{course.fee}</span></div>
                  <Link href={`/courses/${course.slug}`} className="p-2 bg-gray-50 text-primary group-hover:bg-secondary group-hover:text-accent rounded-xl transition-all font-semibold text-xs flex items-center gap-1.5">View Details <ArrowRight className="w-3.5 h-3.5" /></Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center pt-4"><Link href="/courses" className="py-3 px-6 border border-gray-200 hover:bg-gray-50 text-primary font-bold rounded-xl text-sm transition-all inline-block">Explore All Programs</Link></div>
      </section>

      {/* Testimonials Carousel */}
      {activeTestimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3"><span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Student Success</span><h2 className="text-3xl font-extrabold font-heading text-accent">What Our Graduates Say</h2></div>
          <div className="relative max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl flex flex-col items-center text-center space-y-6">
            <div className="flex gap-1 justify-center">{Array(activeTestimonials[activeTestimonialIdx].rating).fill(0).map((_, i) => (<Star key={i} className="w-5 h-5 text-secondary fill-current" />))}</div>
            <AnimatePresence mode="wait"><motion.blockquote key={activeTestimonialIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-gray-600 text-sm md:text-base leading-relaxed font-sans italic min-h-[80px]">&ldquo;{activeTestimonials[activeTestimonialIdx].text}&rdquo;</motion.blockquote></AnimatePresence>
            <div className="flex flex-col items-center">
              {activeTestimonials[activeTestimonialIdx].photo_url ? <Base64Image base64={activeTestimonials[activeTestimonialIdx].photo_url} alt={activeTestimonials[activeTestimonialIdx].student_name} className="w-14 h-14 rounded-full object-cover border-2 border-secondary" /> : <div className="w-14 h-14 rounded-full bg-primary text-secondary flex items-center justify-center text-lg font-bold border-2 border-secondary">{activeTestimonials[activeTestimonialIdx].student_name.charAt(0)}</div>}
              <h4 className="text-sm font-bold text-gray-900 mt-3 font-heading">{activeTestimonials[activeTestimonialIdx].student_name}</h4>
              <span className="text-[10px] text-primary uppercase tracking-wider font-semibold mt-0.5">{activeTestimonials[activeTestimonialIdx].course_name}</span>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setActiveTestimonialIdx((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length)} className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:text-primary transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setActiveTestimonialIdx((prev) => (prev + 1) % activeTestimonials.length)} className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:text-primary transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-primary to-accent text-white rounded-3xl p-8 md:p-14 shadow-xl text-center space-y-6 md:space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="max-w-2xl mx-auto space-y-4"><h2 className="text-3xl md:text-5xl font-extrabold font-heading leading-tight">Ready to Upgrade Your Future?</h2><p className="text-gray-300 text-sm md:text-base leading-relaxed">New training batches are starting on the 10th &amp; 25th of every month. Secure your seat today.</p></div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/enquiry" className="w-full sm:w-auto px-8 py-4 bg-secondary hover:bg-secondary-light text-accent font-bold rounded-xl shadow-lg transition-all">Apply For Next Batch</Link>
            <Link href="/location" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-all">Get Location &amp; Directions</Link>
          </div>
        </motion.div>
      </section>

      {/* Popup Modal */}
      <AnimatePresence>
        {showWelcomePopup && settings.popup_enabled && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowWelcomePopup(false); sessionStorage.setItem('skyline_popup_closed', 'true'); }} className="absolute inset-0 bg-black/20" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }} className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full relative border border-gray-100 z-10 text-left">
              <button onClick={() => { setShowWelcomePopup(false); sessionStorage.setItem('skyline_popup_closed', 'true'); }} className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center cursor-pointer transition-colors z-10">&times;</button>
              {settings.popup_image_base64 ? <div className="aspect-16/10 bg-gray-50 overflow-hidden relative border-b"><Base64Image base64={settings.popup_image_base64} alt={settings.popup_title || 'Special Announcement'} className="w-full h-full object-cover" /></div> : <div className="aspect-16/10 bg-gradient-to-br from-primary to-accent flex flex-col justify-center items-center text-white p-6 text-center border-b"><Sparkles className="w-12 h-12 text-secondary mb-3 animate-bounce" /><h3 className="text-lg font-bold">Special Academy Announcement</h3></div>}
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{settings.popup_title || 'Welcome to Skyline Institute!'}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Unlock world-class training in premium bartending, coffee latte arts, and direct placement with 5-star global hospitality groups.</p>
                <div className="flex gap-3 pt-2">
                  {settings.popup_link ? (
                    <Link href={settings.popup_link} onClick={() => { setShowWelcomePopup(false); sessionStorage.setItem('skyline_popup_closed', 'true'); }} className="flex-1 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-center text-xs transition-colors shadow block">View Details</Link>
                  ) : (
                    <Link href="/enquiry" onClick={() => { setShowWelcomePopup(false); sessionStorage.setItem('skyline_popup_closed', 'true'); }} className="flex-1 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs transition-colors shadow block">Enrol / Inquire Now</Link>
                  )}
                  <button onClick={() => { setShowWelcomePopup(false); sessionStorage.setItem('skyline_popup_closed', 'true'); }} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer">Dismiss</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};