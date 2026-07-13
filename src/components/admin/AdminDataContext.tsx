"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import type {
  Enquiry, Course, GalleryImage, Testimonial, TeamMember,
  SiteSettings, StaffMember, Branch, Section, Student
} from "@/types";

interface AdminData {
  enquiries: Enquiry[];
  courses: Course[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  team: TeamMember[];
  settings: SiteSettings | null;
  staff: StaffMember[];
  branches: Branch[];
  sections: Section[];
  students: Student[];
  loading: boolean;
  refresh: () => void;
  updateEnquiry: (enq: Enquiry) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  saveCourses: (updated: Course[]) => Promise<void>;
  saveGallery: (updated: GalleryImage[]) => Promise<void>;
  saveTestimonials: (updated: Testimonial[]) => Promise<void>;
  saveTeam: (updated: TeamMember[]) => Promise<void>;
  saveSettings: (s: SiteSettings) => Promise<void>;
  saveStaff: (updated: StaffMember[]) => Promise<void>;
  saveStudents: (updated: Student[]) => Promise<void>;
}

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [
      { data: enq }, { data: crs }, { data: gal }, { data: tes },
      { data: teamData }, { data: settingsData }, { data: stf },
      { data: br }, { data: sec }, { data: stu }
    ] = await Promise.all([
      supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("display_order"),
      supabase.from("gallery").select("*").order("display_order"),
      supabase.from("testimonials").select("*").order("display_order"),
      supabase.from("team_members").select("*").order("display_order"),
      supabase.from("site_settings").select("*").single(),
      supabase.from("staff_members").select("*"),
      supabase.from("branches").select("*"),
      supabase.from("sections").select("*"),
      supabase.from("students").select("*").order("created_at", { ascending: false }),
    ]);

    setEnquiries(enq || []);
    setCourses(crs || []);
    setGallery(gal || []);
    setTestimonials(tes || []);
    setTeam(teamData || []);
    setSettings(settingsData || null);
    setStaff(stf || []);
    setBranches(br || []);
    setSections(sec || []);
    setStudents(stu || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const value: AdminData = {
    enquiries, courses, gallery, testimonials, team,
    settings, staff, branches, sections, students,
    loading,
    refresh: fetchAll,
    updateEnquiry: async (enq) => {
      await supabase.from("enquiries").upsert(enq);
      setEnquiries(prev => prev.map(e => e.id === enq.id ? enq : e));
    },
    deleteEnquiry: async (id) => {
      await supabase.from("enquiries").delete().eq("id", id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
    },
    saveCourses: async (updated) => {
      await supabase.from("courses").upsert(updated);
      setCourses(updated);
    },
    saveGallery: async (updated) => {
      await supabase.from("gallery").upsert(updated);
      setGallery(updated);
    },
    saveTestimonials: async (updated) => {
      await supabase.from("testimonials").upsert(updated);
      setTestimonials(updated);
    },
    saveTeam: async (updated) => {
      await supabase.from("team_members").upsert(updated);
      setTeam(updated);
    },
    saveSettings: async (s) => {
      await supabase.from("site_settings").upsert({ id: "default", ...s });
      setSettings(s);
    },
    saveStaff: async (updated) => {
      await supabase.from("staff_members").upsert(updated);
      setStaff(updated);
    },
    saveStudents: async (updated) => {
      const toUpsert = updated.map(s => ({
        id: s.id, roll_number: s.roll_number, name: s.name, email: s.email,
        phone: s.phone, course_id: s.course_id, course_name: s.course_name,
        photo_base64: s.photo_base64 || null, fee_amount: s.fee_amount, fee_paid: s.fee_paid,
        fee_balance: s.fee_balance, reg_date: s.reg_date, valid_till: s.valid_till,
        branch_id: s.branch_id || null, section_id: s.section_id || null,
        created_at: s.created_at || new Date().toISOString()
      }));
      await supabase.from("students").upsert(toUpsert);
      setStudents(updated);
    },
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminDataProvider");
  return ctx;
}