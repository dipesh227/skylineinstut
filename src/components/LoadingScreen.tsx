import { GraduationCap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-8">
      {/* Animated logo ring */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ width: 80, height: 80 }} />
        <div className="relative w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary/10">
          <GraduationCap className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>

      {/* Brand text */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-extrabold font-heading text-slate-900 tracking-tight">
          SKYLINE <span className="text-secondary">INSTITUTE</span>
        </h2>
        <p className="text-xs text-gray-400 font-medium animate-pulse">
          Loading your dashboard…
        </p>
      </div>

      {/* Skeleton bars */}
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}