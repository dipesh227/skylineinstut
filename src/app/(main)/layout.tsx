import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { fetchSettings, fetchCourses } from '@/lib/data';

export const revalidate = 30;

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [settings, courses] = await Promise.all([fetchSettings(), fetchCourses()]);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar settings={settings} courses={courses} />
      <main className="flex-1">{children}</main>
      {settings && <Footer settings={settings} />}
      {settings && <FloatingActions settings={settings} />}
    </div>
  );
}