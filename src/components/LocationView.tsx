import React from 'react';
import { MapPin, Phone, Mail, Clock, Bus, Train, Plane, Navigation, Calendar, Users } from 'lucide-react';
import type { SiteSettings } from '@/types';

interface LocationViewProps { settings: SiteSettings; }

export const LocationView: React.FC<LocationViewProps> = ({ settings }) => {
  const mapEmbedUrl = settings.google_map_embed_url?.trim() || 
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.5!2d79.9819863!3d28.9327586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a0510da2a0ad0d%3A0x73e180e8ac5c7ec9!2sSkyline%20Institute%20of%20Management%20Hospitality%20%26%20Bartending!5e0!3m2!1sen!2sin!4v1783533961521!5m2!1sen!2sin';

  return (
    <div className="space-y-0">
      <section className="relative bg-gradient-to-br from-cream/50 via-white to-cream/30 pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs font-semibold tracking-wide text-primary">
            <Navigation className="w-4 h-4 text-secondary" />
            <span>Visit Our Campus</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-accent leading-tight">
            Find Us in <span className="text-secondary">Khatima</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our state‑of‑the‑art training facility is conveniently located and easily accessible.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <a href={`tel:${settings.contact_phone_1}`} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-primary font-semibold py-3 px-6 rounded-xl transition-all shadow-sm">
              <Phone className="w-5 h-5 text-secondary" /> {settings.contact_phone_1}
            </a>
            <a href={mapEmbedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md">
              <Navigation className="w-5 h-5" /> Get Directions
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white h-[500px] lg:h-full min-h-[400px]">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Skyline Institute Location"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg font-heading">Campus Address</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{settings.contact_address}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-lg font-heading">Direct Contact</h3>
                <div className="space-y-2">
                  <a href={`tel:${settings.contact_phone_1}`} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm">
                    <Phone className="w-4 h-4 text-secondary" /> {settings.contact_phone_1}
                  </a>
                  {settings.contact_phone_2 && (
                    <a href={`tel:${settings.contact_phone_2}`} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm">
                      <Phone className="w-4 h-4 text-secondary" /> {settings.contact_phone_2}
                    </a>
                  )}
                  <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm">
                    <Mail className="w-4 h-4 text-secondary" /> {settings.contact_email}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg font-heading">Visiting Hours</h3>
                <p className="text-gray-600 text-sm mt-1">{settings.contact_working_hours}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Getting Here</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-accent">How to Reach Skyline Institute</h2>
            <p className="text-gray-500 text-sm">Multiple convenient transit options available for your visit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">By Bus</h3>
              <p className="text-gray-500 text-sm leading-relaxed">The main Khatima Bus Station is just a short walk away. Frequent auto‑rickshaws and electric rickshaws run directly past our campus gate.</p>
            </div>

            <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Train className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">By Train</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Khatima Railway Station is only 1.5 km away. Local taxis and rickshaws will get you to the institute in under 10 minutes.</p>
            </div>

            <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">By Air</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Pantnagar Airport (PGH) is the nearest domestic airport, about 65 km away. Taxis and buses connect Pantnagar and Bareilly airports to Khatima.</p>
            </div>
          </div>
        </section>

        <section className="mt-20 bg-cream/30 rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-2xl font-extrabold font-heading text-accent text-center">Plan Your Visit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Calendar className="w-6 h-6 text-secondary shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900">Campus Tour Hours</h4>
                  <p className="text-sm text-gray-600 mt-1">We offer guided campus tours Monday–Saturday from 10:00 AM to 4:00 PM. Walk‑ins are welcome!</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="w-6 h-6 text-secondary shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900">Group Visits</h4>
                  <p className="text-sm text-gray-600 mt-1">For groups of 5 or more, please call ahead so we can arrange a dedicated counsellor for you.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};