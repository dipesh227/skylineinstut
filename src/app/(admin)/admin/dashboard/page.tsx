"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminContext } from "@/components/admin/AdminDataContext";
import { AdminDashboardTab } from "@/components/admin/AdminDashboardTab";
import { AdminCoursesTab } from "@/components/admin/AdminCoursesTab";
import { AdminEnquiriesTab } from "@/components/admin/AdminEnquiriesTab";
import { AdminGalleryTab } from "@/components/admin/AdminGalleryTab";
import { AdminTeamTab } from "@/components/admin/AdminTeamTab";
import { AdminTestimonialsTab } from "@/components/admin/AdminTestimonialsTab";
import { AdminStaffTab } from "@/components/admin/AdminStaffTab";
import { AdminStudentsTab } from "@/components/admin/AdminStudentsTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { LogOut, LayoutDashboard, BookOpen, MessageSquare, Image, UserCheck, Star, Users, GraduationCap, Settings } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

type TabId = "dashboard" | "courses" | "enquiries" | "gallery" | "team" | "testimonials" | "staff" | "students" | "settings";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const data = useAdminContext();

  const handleLogout = () => {
    localStorage.removeItem("skyline_admin_logged_in");
    localStorage.removeItem("skyline_logged_in_staff_id");
    localStorage.removeItem("skyline_logged_in_staff_role");
    router.replace("/admin/login");
  };

  if (data.loading) return <LoadingScreen />;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "enquiries", label: "Enquiries", icon: MessageSquare },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "team", label: "Team", icon: UserCheck },
    { id: "testimonials", label: "Testimonials", icon: Star },
    { id: "staff", label: "Staff", icon: Users },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar with refined primary color */}
      <aside className="w-64 bg-primary text-white flex flex-col">
        <div className="p-6 border-b border-primary-light">
          <h1 className="text-lg font-heading font-bold">Skyline Admin</h1>
          <p className="text-xs text-slate-300 mt-1">{data.settings?.institute_name || "Institute"}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id ? "bg-primary-light text-white" : "text-slate-300 hover:bg-primary-light hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-primary-light">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {activeTab === "dashboard" && <AdminDashboardTab enquiries={data.enquiries} courses={data.courses} onTabChange={(id: string) => setActiveTab(id as TabId)} />}
        {activeTab === "courses" && <AdminCoursesTab courses={data.courses} onSaveCourses={data.saveCourses} />}
        {activeTab === "enquiries" && <AdminEnquiriesTab enquiries={data.enquiries} courses={data.courses} onUpdateEnquiry={data.updateEnquiry} onDeleteEnquiry={data.deleteEnquiry} />}
        {activeTab === "gallery" && <AdminGalleryTab gallery={data.gallery} onSaveGallery={data.saveGallery} />}
        {activeTab === "team" && <AdminTeamTab team={data.team} onSaveTeam={data.saveTeam} />}
        {activeTab === "testimonials" && <AdminTestimonialsTab testimonials={data.testimonials} courses={data.courses} onSaveTestimonials={data.saveTestimonials} />}
        {activeTab === "staff" && <AdminStaffTab staff={data.staff} branches={data.branches} sections={data.sections} onSaveStaff={data.saveStaff} />}
        {activeTab === "students" && <AdminStudentsTab courses={data.courses} students={data.students} onSaveStudents={data.saveStudents} />}
        {activeTab === "settings" && data.settings && <AdminSettingsTab settings={data.settings} onSaveSettings={data.saveSettings} onDatabaseResetTrigger={data.refresh} />}
      </main>
    </div>
  );
}