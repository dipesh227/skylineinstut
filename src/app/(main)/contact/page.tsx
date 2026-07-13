import { fetchCourses, fetchSettings } from "@/lib/data";
import { ContactView } from "@/components/ContactView";

export default async function ContactPage() {
  const [settings, courses] = await Promise.all([fetchSettings(), fetchCourses()]);
  if (!settings) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return <ContactView courses={courses} settings={settings} />;
}