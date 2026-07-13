import React from 'react';
import { ShieldCheck, Heart, Award, Bookmark, Compass, Calendar } from 'lucide-react';
import type { SiteSettings } from '@/types';
import Base64Image from '@/components/Base64Image';

interface AboutViewProps { settings: SiteSettings; }

export const AboutView: React.FC<AboutViewProps> = ({ settings }) => {
  // Split the about_values string into separate lines (supports newline or comma)
  const valuesList = settings.about_values
    ? settings.about_values
        .split(/[\n,]+/)
        .map(v => v.trim())
        .filter(v => v.length > 0)
    : [];

  // If no specific values are set, show a default placeholder
  const displayValues = valuesList.length > 0
    ? valuesList
    : [
        'Precision Craftsmanship',
        '100% Practical Immersion',
        'Guest‑First Empathy',
      ];

  // Icons for each value (alternating)
  const valueIcons = [Award, ShieldCheck, Heart];

  return (
    <div className="space-y-24 py-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Story</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent leading-tight">
          About {settings.institute_name || 'Skyline Institute'}
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Discover our values, founding vision, and historical progress in premium hands‑on hospitality training.
        </p>
      </section>

      {/* Narrative Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-accent">
            Training the Next Generation of Elite Beverage &amp; Service Professionals
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {settings.about_story}
          </p>
        </div>

        <div className="aspect-4/3 rounded-3xl bg-gray-100 overflow-hidden shadow-xl border border-gray-100 relative">
          {settings.about_image ? (
            <Base64Image base64={settings.about_image} alt="About Skyline" className="w-full h-full object-cover" />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
              alt="Training"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-6 left-6 bg-accent/90 backdrop-blur-sm p-4 rounded-xl text-white max-w-xs border border-white/5">
            <span className="block text-secondary font-bold text-xl font-heading">#1 Academy</span>
            <p className="text-[11px] text-gray-300 mt-1 leading-normal">
              Voted by premium beverage brand associations for practical coaching excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary text-white p-8 md:p-10 rounded-3xl shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-secondary text-accent flex items-center justify-center mb-6">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-3 text-secondary">Our Mission</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{settings.about_mission}</p>
        </div>

        <div className="bg-accent text-white p-8 md:p-10 rounded-3xl shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-secondary text-accent flex items-center justify-center mb-6">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-3 text-secondary">Our Vision</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{settings.about_vision}</p>
        </div>
      </section>

      {/* Core Values (dynamic from DB) */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Anchors</span>
          <h2 className="text-3xl font-extrabold font-heading text-accent">The Core Principles We Live By</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayValues.map((value, idx) => {
            const Icon = valueIcons[idx % valueIcons.length];
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-cream text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-base font-bold text-gray-900 font-heading">{value}</h4>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline (still static, could be moved to DB later if needed) */}
      <section className="space-y-12 bg-cream/30 py-16 px-6 rounded-3xl border border-cream/50">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our History</span>
          <h2 className="text-3xl font-extrabold font-heading text-accent">How We Built the Standard</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { year: '2025', title: 'Skyline Institute Founded', desc: 'Established our premier physical academy in Khatima with high-capacity bartending, mixology, and specialty barista training labs.' },
              { year: '2026', title: 'Industry Placement Pioneer', desc: 'Achieved 100% successful practical placement records across leading five-star hotels and premium cafes.' },
              { year: '2027', title: 'Global Expansion & Recognition', desc: 'Formally accredited by international culinary and hospitality boards.' },
              { year: '2028', title: 'Molecular Mixology & Tech Lab', desc: 'Inaugurated our advanced Molecular Lab featuring liquid nitrogen and centrifuge extraction.' },
            ].map((m, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-secondary" />
                  <span className="text-lg font-extrabold font-heading text-primary">{m.year}</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 font-heading">{m.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};