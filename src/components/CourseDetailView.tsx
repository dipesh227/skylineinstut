"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, Clock, Banknote, HelpCircle, GraduationCap, ArrowRight, ShieldAlert } from 'lucide-react';
import { Course } from '@/types';
import Base64Image from '@/components/Base64Image';

interface CourseDetailViewProps { course: Course; relatedCourses: Course[]; }

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({ course, relatedCourses }) => {
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number>(0);

  return (
    <div className="py-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary"><ChevronLeft className="w-4 h-4" /> Back to All Courses</Link>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-video lg:aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-xl border">
            {course.thumbnail_url ? (
              <Base64Image base64={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
            )}
            {course.badge && <span className="absolute top-5 left-5 bg-secondary text-accent text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full shadow-sm">{course.badge}</span>}
          </div>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-accent leading-tight">{course.title}</h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">{course.full_description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cream/40 p-4 rounded-2xl border flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /><div><span className="text-[10px] text-gray-400 uppercase">Duration</span><span className="text-sm font-bold text-accent block">{course.duration}</span></div></div>
            <div className="bg-cream/40 p-4 rounded-2xl border flex items-center gap-3"><Banknote className="w-5 h-5 text-primary" /><div><span className="text-[10px] text-gray-400 uppercase">Course Fee</span><span className="text-sm font-bold text-accent block">{course.fee}</span></div></div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link href={`/enquiry?course=${encodeURIComponent(course.title)}`} className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">Enrol Now <ArrowRight className="w-4.5 h-4.5 text-secondary" /></Link>
            <Link href="/contact" className="px-8 py-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm text-center">Speak with a Counselor</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-1"><span className="text-xs font-bold text-secondary uppercase tracking-[0.15em]">Syllabus</span><h2 className="text-2xl md:text-3xl font-extrabold font-heading text-accent">What You Will Learn</h2></div>
          <div className="space-y-4">
            {(course.curriculum || []).map((mod, idx) => {
              const isOpen = openAccordionIdx === idx;
              return (
                <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <button onClick={() => setOpenAccordionIdx(isOpen ? -1 : idx)} className="w-full text-left p-5 flex items-center justify-between font-bold text-gray-900 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <span className="text-sm md:text-base font-heading text-accent">{mod.heading}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-gray-100 bg-white animate-slide-in">
                      <ul className="space-y-3">
                        {mod.items.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs md:text-sm text-gray-600 leading-relaxed"><span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0 mt-1.5" /><span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-4 bg-cream/30 p-6 rounded-3xl border border-cream/50 space-y-6 h-fit">
          <h4 className="text-sm font-bold text-gray-900 font-heading flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Admission FAQ</h4>
          <div className="space-y-4 text-xs text-gray-600">
            <div><p className="font-bold text-gray-900">Batch Timings?</p><p className="leading-relaxed">Daily 10:00 AM – 5:00 PM at Khatima campus.</p></div>
            <div className="border-t pt-3"><p className="font-bold text-gray-900">Job Assistance?</p><p className="leading-relaxed">100% placement interviews in luxury hotels.</p></div>
            <div className="border-t pt-3"><p className="font-bold text-gray-900">Certificates?</p><p className="leading-relaxed">Yes, certified diplomas on passing practical exams.</p></div>
          </div>
        </div>
      </section>

      {relatedCourses.length > 0 && (
        <section className="space-y-8 pt-8 border-t">
          <div className="space-y-2"><span className="text-xs font-bold text-secondary uppercase">Related Programs</span><h2 className="text-xl md:text-2xl font-extrabold font-heading text-accent">Explore Other Paths</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedCourses.map(rc => (
              <Link key={rc.id} href={`/courses/${rc.slug}`} className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg flex gap-5 items-center group">
                <div className="w-32 aspect-square rounded-xl bg-gray-50 overflow-hidden shrink-0">
                  {rc.thumbnail_url ? <Base64Image base64={rc.thumbnail_url} alt={rc.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Img</div>}
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary font-heading">{rc.title}</h4>
                  <p className="text-gray-500 text-xs line-clamp-2">{rc.short_description}</p>
                  <div className="flex gap-4 text-[10px] font-mono text-gray-400"><span>{rc.duration}</span><span>•</span><span className="text-accent font-bold">{rc.fee}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};