import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { fetchSettings, fetchCourses } from '@/lib/data';
import { AnimatePresence } from 'motion/react';

export const revalidate = 30;

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [settings, courses] = await Promise.all([fetchSettings(), fetchCourses()]);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar settings={settings} courses={courses} />
      <AnimatePresence mode="wait">
        <main className="flex-1" key={Math.random()}>{children}</main>
      </AnimatePresence>
      {settings && <Footer settings={settings} />}
      {settings && <FloatingActions settings={settings} />}
    </div>
  );
}
export async function headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=300',
        },
      ],
    },
  ];
}