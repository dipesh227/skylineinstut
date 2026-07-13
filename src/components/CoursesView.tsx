"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, Banknote, ArrowRight, ShieldCheck } from 'lucide-react';
import { Course } from '@/types';
import Base64Image from '@/components/Base64Image';

interface CoursesViewProps { courses: Course[]; }

export const CoursesView: React.FC<CoursesViewProps> = ({ courses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('all');

  const badges = ['all', ...Array.from(new Set(courses.map(c => c.badge).filter(Boolean)))] as string[];
  const filtered = courses.filter(c => {
    if (!c.is_active) return false;
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBadge = badgeFilter === 'all' || c.badge?.toLowerCase() === badgeFilter.toLowerCase();
    return matchSearch && matchBadge;
  });

  return (
    <div className="space-y-16 py-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Programs</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent">Professional Academy Courses</h1>
        <p className="text-gray-500 text-sm md:text-base">Certified practical trainings designed by beverage champions and hotel operational managers.</p>
      </section>

      <section className="bg-cream/40 p-6 rounded-3xl border flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search programs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-2">Filter:</span>
          {badges.map(badge => (
            <button key={badge} onClick={() => setBadgeFilter(badge)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${badgeFilter === badge ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
              {badge === 'all' ? 'All' : badge}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-700">No programs found</h3>
            <p className="text-gray-500 text-xs mt-1">Try resetting your filter or search words.</p>
          </div>
        ) : (
          filtered.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-2">
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {course.thumbnail_url ? (
                  <Base64Image base64={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
                {course.badge && <span className="absolute top-4 left-4 bg-secondary text-accent text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">{course.badge}</span>}
                <span className="absolute bottom-4 right-4 bg-accent/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">{course.duration}</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors font-heading">{course.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{course.short_description}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Course Fee</span>
                    <span className="text-base font-extrabold text-accent mt-1 block">{course.fee}</span>
                  </div>
                  <Link href={`/courses/${course.slug}`} className="p-2 bg-gray-50 text-primary group-hover:bg-secondary group-hover:text-accent rounded-xl transition-all font-semibold text-xs flex items-center gap-1.5">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex flex-col lg:flex-row gap-8 items-center">
        <div className="p-4 bg-secondary/10 text-secondary rounded-2xl shrink-0"><ShieldCheck className="w-8 h-8 text-secondary" /></div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-gray-900 font-heading">100% Secure Government Accredited Certifications</h4>
          <p className="text-xs text-gray-500 leading-relaxed">All Skyline courses deliver global industry certificates backed by hospitality boards.</p>
        </div>
      </section>
    </div>
  );
};