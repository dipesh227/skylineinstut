"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
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
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-white/90 md:bg-transparent py-4 md:py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center cursor-pointer select-none group">
              <BrandLogo size="md" theme="color" instituteName={settings?.institute_name} logoBase64={settings?.site_logo_base64} />
            </Link>
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-200 py-1.5 ${
                    isActive(item.href) ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
                  }`}>
                  {item.label}
                  {isActive(item.href) && (
                    <motion.span layoutId="navbar-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                  )}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEnquiryModalOpen(true)}
                className="text-xs font-bold px-5 py-2.5 bg-secondary hover:bg-secondary-light text-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-xl p-5 space-y-3.5 overflow-hidden"
            >
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'bg-primary/5 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}>{item.label}</Link>
              ))}
              <div className="pt-3 border-t flex flex-col gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsMobileMenuOpen(false); setEnquiryModalOpen(true); }}
                  className="w-full py-3 bg-secondary hover:bg-secondary-light text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Apply Now <ArrowRight className="w-4 h-4 inline ml-1" />
                </motion.button>
                <Link href="/student/login" className="w-full py-2.5 border border-gray-200 rounded-xl text-xs text-center">Student Login</Link>
                <Link href="/admin/login" className="w-full py-2.5 border border-gray-200 rounded-xl text-xs text-center">Staff Login</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <PopupEnquiryModal isOpen={enquiryModalOpen} onClose={() => setEnquiryModalOpen(false)} courses={courses} />
    </>
  );
};