import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '@/types';

interface FloatingActionsProps {
  settings: SiteSettings;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ settings }) => {
  const cleanPhone = settings.whatsapp_number?.replace(/\s+/g, '').replace('+', '') || '';
  const waUrl = `https://wa.me/${cleanPhone}?text=Hi%20Skyline%20Institute,%20I%20am%20interested%20in%20your%20courses.%20Please%20share%20details.`;
  const callUrl = `tel:${settings.contact_phone_1?.replace(/\s+/g, '')}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {/* Call Button */}
      <a
        href={callUrl}
        className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary-light transition-all duration-300 transform hover:scale-110 active:scale-95 animate-pulse-subtle"
        title="Call Us Now"
      >
        <Phone className="w-5 h-5" />
      </a>

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </div>
  );
};