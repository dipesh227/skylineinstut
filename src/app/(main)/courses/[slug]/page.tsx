import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CourseDetailView } from "@/components/CourseDetailView";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single();
  if (!course) notFound();

  // Fetch related courses (same as before)
  const { data: related } = await supabase.from("courses").select("*").eq("is_active", true).neq("id", course.id).limit(2);

  return <CourseDetailView course={course} relatedCourses={related || []} />;
}