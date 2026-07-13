"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminDataProvider } from "@/components/admin/AdminDataContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loggedIn = localStorage.getItem("skyline_admin_logged_in") === "true";
    if (!loggedIn && pathname !== "/admin/login") {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== "/admin/login") return null;
  return <AdminDataProvider>{children}</AdminDataProvider>;
}