"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MessageCircle, Send, ArrowRight, Phone } from "lucide-react";
import type { SiteSettings } from "@/types";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings | null;
}

const faqs = [
  { q: "What courses do you offer?", a: "We offer Professional Bartending & Mixology, Advanced Flair Bartending, and Professional Barista & Latte Art courses." },
  { q: "What are the fees?", a: "Course fees range from ₹18,000 to ₹35,000 depending on the program. Please check the Courses page for details." },
  { q: "Do you provide placement assistance?", a: "Yes! We have 100% placement assistance with top hotels, resorts, and cruise lines." },
  { q: "What is the duration of courses?", a: "Course durations range from 3 weeks to 2 months." },
  { q: "Where is the campus located?", a: "Our campus is located at Sitarganj Road, Near Bus Station, Khatima, Uttarakhand 262308." },
  { q: "How can I apply?", a: "You can apply by clicking 'Apply Now' on our website or by contacting us via phone or WhatsApp." },
];

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose, settings }) => {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Hello! 👋 I'm SkyBot, your virtual assistant. Choose a question below or type your own.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { text, sender: "user" }]);
    setInput("");

    // Find a matching answer
    const matched = faqs.find(f => f.q.toLowerCase().includes(text.toLowerCase())) || 
                   faqs.find(f => text.toLowerCase().includes(f.q.toLowerCase()));
    
    setTimeout(() => {
      if (matched) {
        setMessages(prev => [...prev, { text: matched.a, sender: "bot" }]);
      } else {
        setMessages(prev => [...prev, { text: "I'm sorry, I couldn't find an answer to that. Would you like to connect with a representative?", sender: "bot" }]);
      }
    }, 500);
  };

  const handleFaqClick = (q: string) => handleSend(q);

  const cleanWhatsApp = settings?.whatsapp_number?.replace(/\s+/g, '').replace('+', '') || '';
  const waUrl = `https://wa.me/${cleanWhatsApp}?text=Hi%20Skyline%20Institute,%20I%20have%20a%20query.`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-secondary" />
              <span className="font-bold text-sm">SkyBot Assistant</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat area */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-xs ${
                  msg.sender === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-white border border-gray-100 text-gray-700 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick FAQ buttons */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {faqs.slice(0, 4).map((faq, i) => (
                <button
                  key={i}
                  onClick={() => handleFaqClick(faq.q)}
                  className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  {faq.q}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <button
              onClick={() => handleSend(input)}
              className="p-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Representative */}
          <div className="p-3 bg-cream/50 border-t border-gray-100 text-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Connect with a Representative
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};