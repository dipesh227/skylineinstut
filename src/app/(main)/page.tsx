import { fetchSettings, fetchCourses } from "@/lib/data";
import { createClient } from "@/utils/supabase/server";
import { LandingClient } from "@/components/LandingClient";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = await createClient();
  const settings = await fetchSettings();
  const courses = await fetchCourses();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  const { data: gallery } = await supabase
    .from("gallery")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <LandingClient
      settings={settings}
      courses={courses}
      testimonials={testimonials || []}
      gallery={gallery || []}
    />
  );
}