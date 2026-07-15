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
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100/50 py-2'
            : 'bg-white/80 md:bg-transparent py-3 md:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-between">
          
          {/* Absolutely positioned large logo – centered vertically in the nav */}
          <div className="absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-50 transition-all duration-500">
            <Link href="/" className="flex items-center">
              <BrandLogo
                size="md"
                theme="color"
                instituteName={settings?.institute_name}
                logoBase64={settings?.site_logo_base64}
                large={!isScrolled}
              />
            </Link>
          </div>

          {/* Spacer – same width as the normal logo area to keep nav links aligned */}
          <div className="w-[160px] md:w-[200px] shrink-0" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions – Apply Now button */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEnquiryModalOpen(true)}
              className="px-5 py-2.5 bg-secondary hover:bg-secondary-light text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/5 text-primary font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setEnquiryModalOpen(true);
                    }}
                    className="w-full py-3 bg-secondary hover:bg-secondary-light text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/student/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 border border-gray-200 rounded-xl text-xs text-center font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Student Login
                    </Link>
                    <Link
                      href="/admin/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 border border-gray-200 rounded-xl text-xs text-center font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" /> Staff Login
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