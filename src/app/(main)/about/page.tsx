import { fetchSettings } from "@/lib/data";
import { AboutView } from "@/components/AboutView";

export default async function AboutPage() {
  const settings = await fetchSettings();
  if (!settings) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return <AboutView settings={settings} />;
}