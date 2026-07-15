"use client";
import { GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';

const pageNames: Record<string, string> = {
  '/': 'Home',
  '/about': 'About Us',
  '/courses': 'Courses',
  '/gallery': 'Gallery',
  '/team': 'Our Team',
  '/location': 'Location',
  '/contact': 'Contact',
  '/verify': 'Certificate Verification',
  '/enquiry': 'Enquiry',
  '/student/login': 'Student Portal',
  '/student/dashboard': 'Student Dashboard',
  '/admin/login': 'Admin Panel',
  '/admin/dashboard': 'Admin Dashboard',
};

export default function LoadingScreen() {
  const pathname = usePathname();
  // Find the best matching page name
  let pageName = '';
  // Exact match first
  if (pageNames[pathname]) {
    pageName = pageNames[pathname];
  } else {
    // Check sub-paths (e.g., /courses/professional-bartending-mixology)
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const basePath = '/' + segments[0];
      if (pageNames[basePath]) {
        pageName = pageNames[basePath];
      } else {
        // Capitalize the first segment as a fallback
        pageName = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ width: 80, height: 80 }}
        />
        <div className="relative w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary/10">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h2 className="text-xl font-extrabold font-heading text-slate-900 tracking-tight">
          SKYLINE <span className="text-secondary">INSTITUTE</span>
        </h2>
        <p className="text-xs text-gray-400 font-medium">
          {pageName ? `Loading ${pageName}…` : 'Loading…'}
        </p>
      </motion.div>
      <div className="flex gap-1.5">
        {[0, 150, 300].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: delay / 1000 }}
          />
        ))}
      </div>
    </div>
  );
}