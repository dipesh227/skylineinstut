"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { PopupEnquiryModal } from '@/components/PopupEnquiryModal';
import type { SiteSettings, Course } from '@/types';

export const Navbar: React.FC<{ settings?: SiteSettings | null; courses?: Course[] }> = ({ settings, courses = [] }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Courses', href: '/courses' },
    { label: 'Verify Certificate', href: '/verify' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Our Team', href: '/team' },
    { label: 'Location', href: '/location' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100/50 py-2'
          : 'bg-white/80 md:bg-transparent py-3 md:py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo – scaled down slightly on mobile */}
            <Link href="/" className="flex items-center group shrink-0">
              <BrandLogo size="sm" className="md:hidden" theme="color" instituteName={settings?.institute_name} logoBase64={settings?.site_logo_base64} />
              <BrandLogo size="md" className="hidden md:flex" theme="color" instituteName={settings?.institute_name} logoBase64={settings?.site_logo_base64} />
            </Link>

            {/* Desktop links – hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href) ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}>
                  {item.label}
                  {isActive(item.href) && <motion.span layoutId="navbar-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />}
                </Link>
              ))}
            </div>

            {/* Desktop Apply Now */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setEnquiryModalOpen(true)}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary-light text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer">
                Apply Now <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-3 md:hidden">
              <Link href="/student/login" className="p-2 text-gray-500 hover:text-primary" aria-label="Student Login">
                <GraduationCap className="w-5 h-5" />
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-gray-600 hover:text-primary rounded-lg" aria-label="Toggle navigation menu">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl overflow-hidden">
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full text-left py-3.5 px-4 rounded-xl text-base font-medium transition-colors ${
                      isActive(item.href) ? 'bg-primary/5 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                    }`}>
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setIsMobileMenuOpen(false); setEnquiryModalOpen(true); }}
                    className="w-full py-3.5 bg-secondary hover:bg-secondary-light text-white font-bold rounded-xl text-base shadow-md flex items-center justify-center gap-2">
                    Apply Now <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/student/login" onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 border border-gray-200 rounded-xl text-sm text-center font-semibold text-gray-600 hover:bg-gray-50">
                      Student Login
                    </Link>
                    <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 border border-gray-200 rounded-xl text-sm text-center font-semibold text-gray-600 hover:bg-gray-50">
                      Staff Login
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <PopupEnquiryModal isOpen={enquiryModalOpen} onClose={() => setEnquiryModalOpen(false)} courses={courses} />
    </>
  );
};