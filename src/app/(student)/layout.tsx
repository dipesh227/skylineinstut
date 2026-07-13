"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loggedInId = localStorage.getItem("skyline_student_logged_in_id");
    if (!loggedInId && pathname !== "/student/login") {
      router.replace("/student/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== "/student/login") return null;
  return <>{children}</>;
}