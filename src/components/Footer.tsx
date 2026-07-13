"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, GraduationCap, ShieldCheck } from 'lucide-react';
import type { SiteSettings } from '@/types';
import { useToast } from '@/components/Toast';
import { BrandLogo } from '@/components/BrandLogo';
import { createClient } from '@/utils/supabase/client';

interface FooterProps { settings: SiteSettings; }

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const { showToast } = useToast();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('subscribers').upsert({ email: email.trim().toLowerCase(), created_at: new Date().toISOString() });
      if (error) {
        if (error.code === '23505') { showToast('This email is already subscribed.', 'info'); }
        else { showToast('Subscription failed. Please try again.', 'error'); }
      } else {
        showToast('Successfully subscribed!', 'success');
        setEmail('');
      }
    } catch (err) {
      showToast('Subscription failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-accent text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-5 space-y-5">
            <Link href="/">
              <BrandLogo
                size="lg"
                theme="dark"
                instituteName={settings.institute_name}
                logoBase64={settings.site_logo_base64}
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">India&apos;s leading training institute for Bartending, Advanced Flair, Barista Coffee Craftsmanship, and 5-Star Food &amp; Beverage Operations.</p>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider font-heading">Join Our Newsletter</h4>
            <p className="text-gray-400 text-sm">Subscribe to get placement drive updates, cocktail masterclass schedules, and career guidance directly.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input type="email" required placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" />
              <button type="submit" disabled={submitting} className="px-6 py-3 bg-secondary hover:bg-secondary-light text-accent font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none cursor-pointer">
                {submitting ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-4 h-4" /> Subscribe</>}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider font-heading">Useful Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home Page</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Institute</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">Academic Programs</Link></li>
              <li><Link href="/verify" className="text-gray-400 hover:text-white transition-colors">Verify Certificate</Link></li>
              <li><Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">Campus Gallery</Link></li>
              <li><Link href="/team" className="text-gray-400 hover:text-white transition-colors">Faculty Directory</Link></li>
            </ul>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider font-heading">Get In Touch</h4>
            <ul className="space-y-3.5 text-sm text-gray-400">
              <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" /><span>{settings.contact_address}</span></li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-secondary shrink-0" /><div className="flex flex-col"><a href={`tel:${settings.contact_phone_1}`} className="hover:text-white transition-colors">{settings.contact_phone_1}</a>{settings.contact_phone_2 && <a href={`tel:${settings.contact_phone_2}`} className="hover:text-white transition-colors">{settings.contact_phone_2}</a>}</div></li>
              <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-secondary shrink-0" /><a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors break-all">{settings.contact_email}</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider font-heading">Operational Hours</h4>
            <div className="flex gap-3 text-sm text-gray-400"><Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" /><div><p className="font-semibold text-white">Daily Timing Profile</p><p className="mt-1 leading-relaxed text-xs">{settings.contact_working_hours}</p></div></div>
            <div className="pt-3">
              <h5 className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-2 font-heading">Social Networks</h5>
              <div className="flex gap-2.5">
                {settings.social_facebook && <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-secondary hover:text-accent text-gray-300 transition-all text-xs">FB</a>}
                {settings.social_instagram && <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-secondary hover:text-accent text-gray-300 transition-all text-xs">IG</a>}
                {settings.social_linkedin && <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-secondary hover:text-accent text-gray-300 transition-all text-xs">IN</a>}
                {settings.social_youtube && <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-secondary hover:text-accent text-gray-300 transition-all text-xs">YT</a>}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>&copy; {currentYear} {settings.institute_name || 'Skyline Institute'}. All Rights Reserved.</span>
          <div className="flex items-center gap-6 font-mono text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>UTC TIME</span>
            <Link href="/student/login" className="flex items-center gap-1 bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white px-2.5 py-1 rounded-md transition-colors"><GraduationCap className="w-3.5 h-3.5" />Student Portal</Link>
            <Link href="/admin/login" className="flex items-center gap-1 bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white px-2.5 py-1 rounded-md transition-colors"><ShieldCheck className="w-3.5 h-3.5" />Staff Login</Link>
          </div>
        </div>

        <div className="border-t border-white/5 mt-6 pt-6 text-center text-[11px] text-gray-500 tracking-wide">
          <span>Designed, Developed & Maintained by </span>
          <a href="https://dreampixeltechnology.in/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary-light hover:underline font-semibold transition-all duration-200">DreamPixel Technology</a>
        </div>
      </div>
    </footer>
  );
};