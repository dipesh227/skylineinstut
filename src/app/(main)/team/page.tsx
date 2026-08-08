import { createClient } from "@/utils/supabase/server";
import Base64Image from "@/components/Base64Image";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: members } = await supabase.from("team_members").select("*").eq("is_active", true).order("display_order");

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Faculty</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent">Meet the Instructors</h1>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto">Industry experts dedicated to crafting the next generation of hospitality professionals.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {members?.map(member => (
          <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow">
              {member.image_url ? (
                <Base64Image base64={member.image_url} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">{member.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-heading">{member.name}</h3>
              <p className="text-secondary text-sm font-semibold">{member.role}</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
            <div className="flex gap-3">
              {member.socials?.facebook && <a href={member.socials.facebook} target="_blank" className="text-gray-400 hover:text-primary"><Facebook className="w-5 h-5" /></a>}
              {member.socials?.instagram && <a href={member.socials.instagram} target="_blank" className="text-gray-400 hover:text-primary"><Instagram className="w-5 h-5" /></a>}
              {member.socials?.linkedin && <a href={member.socials.linkedin} target="_blank" className="text-gray-400 hover:text-primary"><Linkedin className="w-5 h-5" /></a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}