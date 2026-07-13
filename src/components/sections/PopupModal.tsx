"use client";
import { useEffect, useState } from "react";
import Base64Image from "@/components/Base64Image";
import { X } from "lucide-react";
import type { SiteSettings } from "@/types";

export default function PopupModal({ settings }: { settings: SiteSettings }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (settings?.popup_enabled) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  if (!show || !settings?.popup_enabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-primary z-10"
        >
          <X className="w-6 h-6" />
        </button>
        {settings.popup_image_base64 && (
          <div className="w-full h-48">
            <Base64Image
              base64={settings.popup_image_base64}
              alt={settings.popup_title || "Popup"}
              width={400}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6 text-center">
          <h3 className="text-2xl font-heading font-bold text-primary mb-2">
            {settings.popup_title}
          </h3>
          {settings.popup_link && (
            <a
              href={settings.popup_link.startsWith("#") ? `/${settings.popup_link.replace("#", "")}` : settings.popup_link}
              className="mt-4 inline-block bg-secondary hover:bg-secondary-light text-primary font-semibold px-6 py-2 rounded-full transition"
            >
              Learn More
            </a>
          )}
        </div>
      </div>
    </div>
  );
}