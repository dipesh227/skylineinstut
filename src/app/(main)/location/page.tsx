import { fetchSettings } from "@/lib/data";
import { LocationView } from "@/components/LocationView";

export default async function LocationPage() {
  const settings = await fetchSettings();
  if (!settings) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return <LocationView settings={settings} />;
}