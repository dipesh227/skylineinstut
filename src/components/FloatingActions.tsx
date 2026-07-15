"use client";
import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Bot } from 'lucide-react';
import type { SiteSettings } from '@/types';
import { ChatbotModal } from '@/components/ChatbotModal';

interface FloatingActionsProps { settings: SiteSettings; }

export const FloatingActions: React.FC<FloatingActionsProps> = ({ settings }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const cleanPhone = settings.whatsapp_number?.replace(/\s+/g, '').replace('+', '') || '';
  const waUrl = `https://wa.me/${cleanPhone}?text=Hi%20Skyline%20Institute,%20I%20am%20interested%20in%20your%20courses.%20Please%20share%20details.`;
  const callUrl = `tel:${settings.contact_phone_1?.replace(/\s+/g, '')}`;

  useEffect(() => {
    const timer = setTimeout(() => setChatOpen(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <a href={callUrl} className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-light transition-all duration-300 transform hover:scale-110 active:scale-95 animate-pulse-subtle" title="Call Us Now">
          <Phone className="w-6 h-6" />
        </a>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all duration-300 transform hover:scale-110 active:scale-95" title="Chat on WhatsApp">
          <MessageCircle className="w-7 h-7 fill-current" />
        </a>
        <button onClick={() => setChatOpen(!chatOpen)} className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-all duration-300 transform hover:scale-110 active:scale-95" title="Ask SkyBot">
          <Bot className="w-6 h-6" />
        </button>
      </div>
      <ChatbotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} settings={settings} />
    </>
  );
};