"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Enquiry, Course, GalleryImage, Testimonial, TeamMember, SiteSettings, StaffMember, Branch, Section, Student } from "@/types";

const supabase = createClient();

export function useAdminData() {
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
      { data: enqData }, { data: crsData }, { data: galData },
      { data: tesData }, { data: teamData }, { data: setData },
      { data: stfData }, { data: brData }, { data: secData }, { data: stuData }
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
      supabase.from("students").select("*").order("created_at", { ascending: false })
    ]);

    if (enqData) setEnquiries(enqData);
    if (crsData) setCourses(crsData);
    if (galData) setGallery(galData);
    if (tesData) setTestimonials(tesData);
    if (teamData) setTeam(teamData);
    if (setData) setSettings(setData);
    if (stfData) setStaff(stfData);
    if (brData) setBranches(brData);
    if (secData) setSections(secData);
    if (stuData) setStudents(stuData);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateEnquiry = async (enq: Enquiry) => {
    await supabase.from("enquiries").upsert(enq);
    setEnquiries(prev => prev.map(e => e.id === enq.id ? enq : e));
  };
  const deleteEnquiry = async (id: string) => {
    await supabase.from("enquiries").delete().eq("id", id);
    setEnquiries(prev => prev.filter(e => e.id !== id));
  };
  const saveCourses = async (updated: Course[]) => {
    await supabase.from("courses").upsert(updated);
    setCourses(updated);
    const ids = updated.map(c => c.id).filter(Boolean);
    if (ids.length > 0) await supabase.from("courses").delete().not("id", "in", `(${ids.join(",")})`);
  };
  const saveGallery = async (updated: GalleryImage[]) => {
    await supabase.from("gallery").upsert(updated);
    setGallery(updated);
  };
  const saveTestimonials = async (updated: Testimonial[]) => {
    await supabase.from("testimonials").upsert(updated);
    setTestimonials(updated);
  };
  const saveTeam = async (updated: TeamMember[]) => {
    await supabase.from("team_members").upsert(updated);
    setTeam(updated);
  };
  const saveSettings = async (s: SiteSettings) => {
    await supabase.from("site_settings").upsert({ id: "default", ...s });
    setSettings(s);
  };
  const saveStaff = async (updated: StaffMember[]) => {
    await supabase.from("staff_members").upsert(updated);
    setStaff(updated);
  };
  const saveStudents = async (updated: Student[]) => {
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
  };

  return {
    enquiries, courses, gallery, testimonials, team,
    settings, staff, branches, sections, students,
    loading,
    updateEnquiry, deleteEnquiry,
    saveCourses, saveGallery, saveTestimonials, saveTeam,
    saveSettings, saveStaff, saveStudents,
    refresh: fetchAll
  };
}