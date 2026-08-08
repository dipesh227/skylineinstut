export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  course: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  replied: boolean;
  admission_ok: boolean;
  fee_paid: boolean;
  fee_amount?: number;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  curriculum: {
    heading: string;
    items: string[];
  }[];
  duration: string;
  fee: string;
  fee_numeric: number;
  badge?: string;
  thumbnail_url: string;
  display_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  socials: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  display_order: number;
  is_active: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  category: string;
  caption: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  student_name: string;
  photo_url?: string;
  course_id: string;
  course_name: string;
  rating: number;
  text: string;
  placement_hotel?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SiteSettings {
  hero_headline: string;
  hero_subtext: string;
  hero_cta_text: string;
  about_story: string;
  about_mission: string;
  about_vision: string;
  about_values: string;
  contact_address: string;
  contact_phone_1: string;
  contact_phone_2: string;
  contact_email: string;
  contact_working_hours: string;
  google_map_embed_url: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_linkedin: string;
  whatsapp_number: string;
  meta_title: string;
  meta_description: string;
  hero_bg_image?: string;
  about_image?: string;
  contact_image?: string;
  popup_enabled?: boolean;
  popup_image_base64?: string;
  popup_title?: string;
  popup_link?: string;
  office_seal_base64?: string;
  hod_signature_base64?: string;
  institute_name?: string;
  site_logo_base64?: string;
}

export interface StudentAttendance {
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface StudentResult {
  exam_name: string;
  subject: string;
  marks_obtained: number;
  max_marks: number;
  remarks?: string;
}

export interface FeeLedgerEntry {
  id: string;
  date: string;
  amount: number;
  collected_by: string;
  payment_mode: string;
  remarks?: string;
}

export interface Student {
  id: string;
  roll_number: string;
  name: string;
  email: string;
  phone: string;
  course_id: string;
  course_name: string;
  photo_base64?: string;
  fee_amount: number;
  fee_paid: number;
  fee_balance: number;
  reg_date: string;
  valid_till: string;
  created_at?: string;
  branch_id?: string;
  section_id?: string;
  attendance_records?: StudentAttendance[];
  results_records?: StudentResult[];
  fee_ledgers?: FeeLedgerEntry[];
}

export type PageId =
  | 'home' | 'about' | 'courses' | 'course-detail'
  | 'gallery' | 'team' | 'location' | 'contact'
  | 'student-login' | 'student-dashboard'
  | 'admin-login' | 'admin-dashboard'
  | 'admin-enquiries' | 'admin-courses' | 'admin-gallery'
  | 'admin-testimonials' | 'admin-team' | 'admin-settings'
  | 'admin-students' | 'verify-certificate';
export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface Section {
  id: string;
  name: string;
  branch_id: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'master_admin' | 'hod' | 'teacher';
  branch_id?: string;
  section_id?: string;
  phone?: string;
  signature_base64?: string;
  is_active: boolean;
  created_at: string;
}
