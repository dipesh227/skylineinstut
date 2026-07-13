import React from 'react';
import { Mail, Instagram, Linkedin, Facebook, Users2, GraduationCap } from 'lucide-react';
import type { TeamMember } from '@/types';
import { SafeImage } from '@/components/SafeImage';

interface TeamViewProps { team: TeamMember[]; }

export const TeamView: React.FC<TeamViewProps> = ({ team }) => {
  const activeMembers = team.filter(member => member.is_active);

  return (
    <div className="space-y-16 py-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Our Instructors</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-accent leading-tight">Meet Your Industry Coaches</h1>
        <p className="text-gray-500 text-sm md:text-base">Our teachers are champion bartenders, luxury hotel sommeliers, and elite baristas who have spent decades behind international service floors.</p>
      </section>

      <section className="space-y-12">
        {activeMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {activeMembers.map(member => (
              <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5">
                <div className="aspect-[4/5] bg-gray-50 overflow-hidden relative">
                  <SafeImage src={member.image_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors font-heading leading-tight">{member.name}</h3>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">{member.role}</span>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 pt-2 border-t border-gray-50">{member.bio}</p>
                  </div>
                  <div className="flex gap-2.5 pt-2 border-t border-gray-50 items-center justify-start">
                    {member.socials.facebook && <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary p-1.5 rounded hover:bg-gray-50 transition-colors"><Facebook className="w-4 h-4" /></a>}
                    {member.socials.instagram && <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary p-1.5 rounded hover:bg-gray-50 transition-colors"><Instagram className="w-4 h-4" /></a>}
                    {member.socials.linkedin && <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary p-1.5 rounded hover:bg-gray-50 transition-colors"><Linkedin className="w-4 h-4" /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Users2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-700">No active coaches defined</h3>
            <p className="text-gray-500 text-xs mt-1">Check back soon for staff profiles.</p>
          </div>
        )}
      </section>

      <section className="bg-cream/40 p-8 rounded-3xl border border-cream/50 flex flex-col lg:flex-row gap-8 items-center">
        <div className="p-4 bg-primary text-secondary rounded-2xl shrink-0"><GraduationCap className="w-8 h-8" /></div>
        <div className="space-y-1.5 text-left">
          <h4 className="text-sm font-bold text-gray-900 font-heading">Guest Masterclasses by International Liquid Experts</h4>
          <p className="text-xs text-gray-500 leading-relaxed">In addition to our full-time faculty, Skyline regularly hosts guest seminars led by visiting brand ambassadors of top distilleries, flair champions from overseas, and premium cafe founders, ensuring you stay in touch with the latest global techniques.</p>
        </div>
      </section>
    </div>
  );
};