import { fetchCourses } from "@/lib/data";
import { CoursesView } from "@/components/CoursesView";

export default async function CoursesPage() {
  const courses = await fetchCourses();
  return <CoursesView courses={courses} />;
}