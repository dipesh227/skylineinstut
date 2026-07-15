"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, Trophy, Sparkles, Star, ChevronLeft, ChevronRight,
  CheckCircle2, Flame, Coffee, Shield, Users, Zap, Globe, Camera, Search, X
} from 'lucide-react';
import type { SiteSettings, Course, Testimonial, GalleryImage } from '@/types';
import Base64Image from '@/components/Base64Image';
import { PopupEnquiryModal } from '@/components/PopupEnquiryModal';

interface LandingClientProps {
  settings: SiteSettings;
  courses: Course[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
}

export const LandingClient: React.FC<LandingClientProps> = ({
  settings,
  courses,
  testimonials,
  gallery,
}) => {
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const activeTestimonials = testimonials.filter(t => t.is_active);
  const activeCourses = courses.filter(c => c.is_active).slice(0, 3);
  const activeGallery = gallery.filter(g => g.is_active);

  const [stats, setStats] = useState({ students: 0, placements: 0, coaches: 0, years: 0 });
  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setStats({
        students: Math.min(Math.floor((2500 / 30) * step), 2500),
        placements: Math.min(Math.floor((100 / 30) * step), 100),
        coaches: Math.min(Math.floor((12 / 30) * step), 12),
        years: Math.min(Math.floor((8 / 30) * step), 8),
      });
      if (step >= 30) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (settings.popup_enabled) {
      const dismissed = sessionStorage.getItem('skyline_popup_closed');
      if (dismissed !== 'true') setShowPopup(true);
    }
  }, [settings]);

  const faqs = [
    { q: 'What is the duration of the courses?', a: 'Course durations range from 3 weeks to 2 months, depending on the program.' },
    { q: 'Do you provide placement assistance?', a: 'Yes, we offer 100% placement assistance with top hotels and cruise lines.' },
    { q: 'Is there any age limit for admission?', a: 'No, anyone above 18 years with a passion for hospitality can apply.' },
    { q: 'Are the certificates internationally recognized?', a: 'Absolutely, our certifications are accredited and accepted worldwide.' },
  ];

  return (
    <div className="space-y-24 pt-16 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-cream/20 pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden">
        {/* Soft background gradient shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cream/40 to-transparent -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium tracking-wide"
              >
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>India&rsquo;s Premier Hospitality Academy</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading text-accent leading-[1.1] tracking-tight"
              >
                {settings.hero_headline.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-secondary">{settings.hero_headline.split(' ').pop()}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl"
              >
                {settings.hero_subtext}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 pt-2"
              >
                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  {settings.hero_cta_text}
                  <ArrowRight className="w-5 h-5 text-secondary group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/courses"
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-primary border border-gray-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:border-primary/30"
                >
                  Browse Courses
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-sm text-gray-600 font-medium"
              >
                {['100% Practical Labs', '5-Star Placements', 'Lifetime Mentorship'].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Image Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="lg:col-span-5 relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl blur-xl -z-10" />
              <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-gray-100">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  {settings.hero_bg_image ? (
                    <Base64Image base64={settings.hero_bg_image} alt="Skyline Training" className="w-full h-full object-cover" width={600} height={450} priority />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      Professional Training Image
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 120 }}
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Track</p>
                  <p className="text-xs font-extrabold text-accent">Confirmed Placements</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 120 }}
                whileHover={{ scale: 1.05 }}
                className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Star className="w-5 h-5 text-secondary fill-current" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accredited</p>
                  <p className="text-xs font-extrabold text-accent">Premium Academy</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Stats */}
      <section className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary text-white rounded-3xl p-8 md:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10"
        >
          {[
            { value: `${stats.students}+`, label: 'Graduates Trained' },
            { value: `${stats.placements}%`, label: 'Placement Record' },
            { value: `${stats.coaches}+`, label: 'Professional Coaches' },
            { value: `${stats.years}+`, label: 'Years of Excellence' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4">
              <span className="text-3xl md:text-5xl font-extrabold font-heading text-secondary">{stat.value}</span>
              <span className="text-xs md:text-sm text-gray-300 font-medium mt-2 text-center uppercase">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 3. Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Curriculum</span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-accent">Featured Academy Programs</h2>
          <p className="text-gray-500 text-sm">Select a course to view deep curriculum modules and apply for enrollment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {activeCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl border shadow-md hover:shadow-xl flex flex-col overflow-hidden group transition-all duration-300"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {course.thumbnail_url ? (
                  <Base64Image base64={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
                {course.badge && (
                  <span className="absolute top-4 left-4 bg-secondary text-accent text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">{course.badge}</span>
                )}
                <span className="absolute bottom-4 right-4 bg-accent/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">{course.duration}</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary font-heading">{course.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2">{course.short_description}</p>
                <div className="pt-4 border-t flex items-center justify-between">
                  <div><span className="text-[10px] font-bold text-gray-400 uppercase">Fee</span><span className="text-base font-extrabold text-accent ml-1">{course.fee}</span></div>
                  <Link href={`/courses/${course.slug}`} className="p-2 bg-gray-50 text-primary group-hover:bg-secondary group-hover:text-accent rounded-xl text-xs font-semibold flex items-center gap-1">Details <ArrowRight className="w-3.5 h-3.5" /></Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/courses" className="inline-block py-3 px-6 border border-gray-200 hover:bg-gray-50 text-primary font-bold rounded-xl text-sm transition-all">Explore All Programs</Link>
        </div>
      </section>

      {/* 4. Testimonials Carousel */}
      {activeTestimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Student Success</span>
            <h2 className="text-3xl font-extrabold font-heading text-accent">What Our Graduates Say</h2>
          </div>
          <div className="relative max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border shadow-xl flex flex-col items-center text-center space-y-6">
            <div className="flex gap-1">{Array(activeTestimonials[activeTestimonial].rating).fill(0).map((_, i) => <Star key={i} className="w-5 h-5 text-secondary fill-current" />)}</div>
            <AnimatePresence mode="wait">
              <motion.blockquote key={activeTestimonial} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-gray-600 text-sm md:text-base italic min-h-[80px]">
                &ldquo;{activeTestimonials[activeTestimonial].text}&rdquo;
              </motion.blockquote>
            </AnimatePresence>
            <div className="flex flex-col items-center">
              {activeTestimonials[activeTestimonial].photo_url ? (
                <Base64Image base64={activeTestimonials[activeTestimonial].photo_url} alt={activeTestimonials[activeTestimonial].student_name} className="w-14 h-14 rounded-full object-cover border-2 border-secondary" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary text-secondary flex items-center justify-center text-lg font-bold border-2 border-secondary">{activeTestimonials[activeTestimonial].student_name.charAt(0)}</div>
              )}
              <h4 className="text-sm font-bold text-gray-900 mt-3 font-heading">{activeTestimonials[activeTestimonial].student_name}</h4>
              <span className="text-[10px] text-primary uppercase font-semibold">{activeTestimonials[activeTestimonial].course_name}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTestimonial(p => (p - 1 + activeTestimonials.length) % activeTestimonials.length)} className="p-2 rounded-full border hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setActiveTestimonial(p => (p + 1) % activeTestimonials.length)} className="p-2 rounded-full border hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Gallery Marquee */}
      {activeGallery.length > 0 && (
        <section className="w-full space-y-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b pb-6">
            <div className="space-y-2 text-left">
              <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Campus Vibe</span>
              <h2 className="text-3xl font-extrabold font-heading text-accent">Latest Practical Class Photos</h2>
            </div>
            <Link href="/gallery" className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1.5">Explore Full Gallery <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="relative w-full flex overflow-x-hidden py-4">
            <div className="flex gap-6 animate-infinite-scroll-slow whitespace-nowrap items-center select-none py-2">
              {[...activeGallery, ...activeGallery].map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="relative w-72 h-72 md:w-80 md:h-80 bg-gray-100 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer shrink-0 group">
                  {item.url ? (
                    <Base64Image base64={item.url} alt={item.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 p-4 flex flex-col justify-end">
                    <span className="text-secondary text-xs font-bold uppercase">{item.category}</span>
                    <p className="text-white text-sm font-semibold">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. USP Section */}
      <section className="bg-cream/40 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">State-of-the-Art Setup</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-accent">Replicated Physical Bar Labs & Live Hotel Mockups</h2>
            <p className="text-gray-600 text-sm">We don't teach from textbooks. Our campus is built around 1:1 physical setups.</p>
            <div className="space-y-4">
              {[{ icon: Flame, title: 'Complete Flame & Flair Arena', desc: 'Indoor and outdoor arenas for bottle flips and fire tricks.' }, { icon: Coffee, title: 'Commercial Espresso Stations', desc: 'Elite multi-group extractors, grinders, and milk frothers.' }].map((item, i) => (
                <motion.div key={i} whileHover={{ x: 6 }} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl"><item.icon className="w-5 h-5 text-secondary" /></div>
                  <div><h4 className="text-sm font-bold text-gray-900">{item.title}</h4><p className="text-xs text-gray-500 mt-1">{item.desc}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-video lg:aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-xl border-8 border-white"
          >
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80" alt="Mock restaurant" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary to-accent text-white rounded-3xl p-8 md:p-14 text-center space-y-6 relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading">Ready to Upgrade Your Future?</h2>
            <p className="text-gray-300">New batches start on the 10th &amp; 25th of every month. Secure your seat today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setEnquiryModalOpen(true)} className="px-8 py-4 bg-secondary hover:bg-secondary-light text-accent font-bold rounded-xl">Apply For Next Batch</button>
            <Link href="/location" className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl">Get Location & Directions</Link>
          </div>
        </motion.div>
      </section>

      {/* 8. Welcome Popup Overlay (session-based) */}
      <AnimatePresence>
        {showPopup && settings.popup_enabled && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPopup(false); sessionStorage.setItem('skyline_popup_closed', 'true'); }}
              className="absolute inset-0 bg-black/20"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full relative border z-10 text-left"
            >
              <button
                onClick={() => { setShowPopup(false); sessionStorage.setItem('skyline_popup_closed', 'true'); }}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white w-7 h-7 rounded-full flex items-center justify-center z-10"
              >
                &times;
              </button>
              {settings.popup_image_base64 ? (
                <div className="aspect-16/10 bg-gray-50 overflow-hidden border-b">
                  <Base64Image base64={settings.popup_image_base64} alt={settings.popup_title || 'Popup'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-16/10 bg-gradient-to-br from-primary to-accent flex flex-col justify-center items-center text-white p-6 border-b">
                  <Sparkles className="w-12 h-12 text-secondary mb-3" />
                  <h3 className="text-lg font-bold">Special Announcement</h3>
                </div>
              )}
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">{settings.popup_title || 'Welcome!'}</h3>
                <p className="text-gray-500 text-xs">Unlock world-class training in premium bartending, latte arts, and direct placement with 5-star global hospitality groups.</p>
                <div className="flex gap-3 pt-2">
                  {settings.popup_link ? (
                    <Link href={settings.popup_link} onClick={() => setShowPopup(false)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-center text-xs shadow block">View Details</Link>
                  ) : (
                    <button onClick={() => { setShowPopup(false); setEnquiryModalOpen(true); }} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs">Enrol Now</button>
                  )}
                  <button onClick={() => setShowPopup(false)} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl text-xs">Dismiss</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enquiry Modal */}
      <PopupEnquiryModal isOpen={enquiryModalOpen} onClose={() => setEnquiryModalOpen(false)} courses={courses} />
    </div>
  );
};