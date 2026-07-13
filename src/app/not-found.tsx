import Link from 'next/link';
import { GraduationCap, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      {/* Decorative icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-30" style={{ width: 100, height: 100 }} />
        <div className="relative w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-rose-100">
          <span className="text-5xl font-extrabold text-rose-500">404</span>
        </div>
      </div>

      {/* Title & description */}
      <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 mb-3">
        Page Not Found
      </h1>
      <p className="text-gray-500 text-sm md:text-base max-w-md leading-relaxed mb-8">
        The page you are looking for doesn't exist or has been moved.  
        Please check the URL or return to the homepage.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-primary border border-gray-200 font-semibold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      {/* Institute branding (always visible) */}
      <div className="mt-12 flex items-center gap-2 text-gray-400">
        <GraduationCap className="w-5 h-5" />
        <span className="text-xs font-semibold tracking-wider uppercase">Skyline Institute</span>
      </div>
    </div>
  );
}