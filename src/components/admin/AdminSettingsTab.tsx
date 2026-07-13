"use client";
import React, { useState } from 'react';
import { Save, Upload, Globe, Sliders, Sparkles, Database, ShieldAlert, X } from 'lucide-react';
import { SiteSettings } from '@/types';
import { useToast } from '@/components/Toast';

interface AdminSettingsTabProps {
  settings: SiteSettings;
  onSaveSettings: (updated: SiteSettings) => void;
  onDatabaseResetTrigger: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ settings, onSaveSettings, onDatabaseResetTrigger }) => {
  const { showToast } = useToast();

  const [instituteName, setInstituteName] = useState(settings.institute_name || 'Skyline Institute');
  const [siteLogo, setSiteLogo] = useState(settings.site_logo_base64 || '');
  const [heroTitle, setHeroTitle] = useState(settings.hero_headline);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.hero_subtext);
  const [aboutStory, setAboutStory] = useState(settings.about_story);
  const [aboutMission, setAboutMission] = useState(settings.about_mission);
  const [aboutVision, setAboutVision] = useState(settings.about_vision);
  const [address, setAddress] = useState(settings.contact_address);
  const [phone1, setPhone1] = useState(settings.contact_phone_1);
  const [phone2, setPhone2] = useState(settings.contact_phone_2 || '');
  const [email, setEmail] = useState(settings.contact_email);
  const [workingHours, setWorkingHours] = useState(settings.contact_working_hours);
  const [mapEmbed, setMapEmbed] = useState(settings.google_map_embed_url);
  const [seoTitle, setSeoTitle] = useState(settings.meta_title || '');
  const [seoDesc, setSeoDesc] = useState(settings.meta_description || '');
  const [heroBgImage, setHeroBgImage] = useState(settings.hero_bg_image || '');
  const [aboutImage, setAboutImage] = useState(settings.about_image || '');
  const [contactImage, setContactImage] = useState(settings.contact_image || '');
  const [popupEnabled, setPopupEnabled] = useState(settings.popup_enabled ?? false);
  const [popupImageBase64, setPopupImageBase64] = useState(settings.popup_image_base64 || '');
  const [popupTitle, setPopupTitle] = useState(settings.popup_title || '');
  const [popupLink, setPopupLink] = useState(settings.popup_link || '');
  const [officeSeal, setOfficeSeal] = useState(settings.office_seal_base64 || '');
  const [hodSignature, setHodSignature] = useState(settings.hod_signature_base64 || '');

  const handleBase64FileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 1.5) { showToast('Image too large', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); showToast('Image encoded', 'success'); };
    reader.onerror = () => showToast('Error converting', 'error');
    reader.readAsDataURL(file);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      institute_name: instituteName.trim(),
      site_logo_base64: siteLogo,
      hero_headline: heroTitle.trim(),
      hero_subtext: heroSubtitle.trim(),
      about_story: aboutStory.trim(),
      about_mission: aboutMission.trim(),
      about_vision: aboutVision.trim(),
      contact_address: address.trim(),
      contact_phone_1: phone1.trim(),
      contact_phone_2: phone2.trim(),
      contact_email: email.trim(),
      contact_working_hours: workingHours.trim(),
      google_map_embed_url: mapEmbed.trim(),
      meta_title: seoTitle.trim(),
      meta_description: seoDesc.trim(),
      hero_bg_image: heroBgImage,
      about_image: aboutImage,
      contact_image: contactImage,
      popup_enabled: popupEnabled,
      popup_image_base64: popupImageBase64,
      popup_title: popupTitle.trim(),
      popup_link: popupLink.trim(),
      office_seal_base64: officeSeal,
      hod_signature_base64: hodSignature,
    };
    onSaveSettings(updated);
    showToast('Settings saved successfully!', 'success');
  };

  const handleFactoryReset = () => {
    if (window.confirm('Reset to database defaults? This will reload settings from the server.')) {
      onDatabaseResetTrigger();
      showToast('Settings reloaded from database.', 'success');
    }
  };

  return (
    <div className="space-y-10 text-left animate-slide-in pb-16">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-900">Institute Configurations Portal</h2>
        <p className="text-xs text-gray-500 mt-1">Configure global text statements, live phone numbers, embed maps, SEO headers, and signature/stamp parameters.</p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSaveSubmit} className="w-full space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          
          {/* Branding */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> 0. Brand Whitelabeling &amp; custom logo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Institute Branding Name *</label>
                <input type="text" required value={instituteName} onChange={(e) => setInstituteName(e.target.value)} placeholder="e.g. Skyline Institute" className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Institute Brand Logo (Base64)</label>
                <div className="flex items-center gap-3">
                  {siteLogo ? (
                    <div className="relative shrink-0 border border-gray-200 p-1.5 rounded-lg bg-slate-50">
                      <img src={siteLogo} alt="Preview Logo" className="h-10 w-10 object-contain" />
                      <button type="button" onClick={() => setSiteLogo('')} className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-sm transition-colors cursor-pointer" title="Remove Logo">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-11 w-11 shrink-0 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-[10px]">Default</div>
                  )}
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 select-none transition-all">
                      <Upload className="w-3.5 h-3.5" /> Upload Logo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBase64FileChange(e, setSiteLogo)} />
                    </label>
                    <span className="text-[9px] text-gray-400 mt-1 block">Square or horizontal logo. Less than 1.5MB.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Configurations */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> 1. Home Page Hero text
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Hero Display Title</label>
                <input type="text" required value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Hero Subtitle</label>
                <input type="text" required value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" />
              </div>
            </div>
          </div>

          {/* Story, Mission & Vision */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 2. Narrative, Mission &amp; Vision Blocks
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Our Story Narrative</label>
                <textarea rows={4} required value={aboutStory} onChange={(e) => setAboutStory(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mission Statement</label>
                  <textarea rows={4} required value={aboutMission} onChange={(e) => setAboutMission(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Founding Vision Statement</label>
                  <textarea rows={4} required value={aboutVision} onChange={(e) => setAboutVision(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <Database className="w-4 h-4" /> 3. Contact &amp; Geographic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Primary Support Phone *</label><input type="text" required value={phone1} onChange={(e) => setPhone1(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Secondary Admissions Phone</label><input type="text" value={phone2} onChange={(e) => setPhone2(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Campus Support Email Address *</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-mono" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Visiting Working Hours</label><input type="text" required value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
            </div>
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Campus Physical Address</label><input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Google Maps Embedded Iframe URL</label><input type="text" required value={mapEmbed} onChange={(e) => setMapEmbed(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-mono" /></div>
          </div>

          {/* SEO Configurations */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> 4. Default Search Engine Optimization (SEO)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">SEO Page Title Header</label><input type="text" required value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold" /></div>
              <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">SEO Meta Description</label><input type="text" required value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs" /></div>
            </div>
          </div>

          {/* Section-wise Base64 Styles & Images */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-primary" /> 5. Section-wise Background Styles &amp; Images
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Upload customized banner images that will be rendered dynamically in place of default stock layouts.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Hero Background */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <span className="block text-[10px] font-bold text-gray-700 uppercase">Home Hero Background</span>
                {heroBgImage ? (
                  <div className="relative h-24 bg-cover bg-center rounded-lg border" style={{ backgroundImage: `url(${heroBgImage})` }}>
                    <button type="button" onClick={() => setHeroBgImage('')} className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer shadow-md">&times;</button>
                  </div>
                ) : (
                  <div className="h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold border border-dashed">Using stock background</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBase64FileChange(e, setHeroBgImage)} className="block w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-primary file:text-white cursor-pointer" />
              </div>

              {/* About Section Image */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <span className="block text-[10px] font-bold text-gray-700 uppercase">About Section Side Image</span>
                {aboutImage ? (
                  <div className="relative h-24 bg-cover bg-center rounded-lg border" style={{ backgroundImage: `url(${aboutImage})` }}>
                    <button type="button" onClick={() => setAboutImage('')} className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer shadow-md">&times;</button>
                  </div>
                ) : (
                  <div className="h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold border border-dashed">Using default bartender art</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBase64FileChange(e, setAboutImage)} className="block w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-primary file:text-white cursor-pointer" />
              </div>

              {/* Contact Banner Image */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <span className="block text-[10px] font-bold text-gray-700 uppercase">Contact Section Banner</span>
                {contactImage ? (
                  <div className="relative h-24 bg-cover bg-center rounded-lg border" style={{ backgroundImage: `url(${contactImage})` }}>
                    <button type="button" onClick={() => setContactImage('')} className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer shadow-md">&times;</button>
                  </div>
                ) : (
                  <div className="h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold border border-dashed">Using default banner image</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBase64FileChange(e, setContactImage)} className="block w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-primary file:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Startup Welcome Announcement Popup */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> 6. Interactive Homepage Welcome Popup
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Configure an automated popup banner that triggers when external users visit the main website.</p>
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-gray-150 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-900">Enable Website Welcome Popup</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Toggle ON to instantly show the uploaded popup to all website visitors.</span>
                </div>
                <button type="button" onClick={() => setPopupEnabled(!popupEnabled)} className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer outline-none ${popupEnabled ? 'bg-emerald-500' : 'bg-slate-350'}`}>
                  <span className={`absolute top-1 bg-white w-5 h-5 rounded-full transition-all shadow-sm ${popupEnabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
              {popupEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-150 animate-fade-in">
                  <div className="space-y-3">
                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Popup Banner Headline / Title</label><input type="text" placeholder="E.g., Admissions Open for July 2026 Batches!" value={popupTitle} onChange={(e) => setPopupTitle(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none" /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Action Button / Redirect URL</label><input type="text" placeholder="E.g., #enquiry, https://wa.me/..." value={popupLink} onChange={(e) => setPopupLink(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:outline-none" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Popup Image Banner *</label>
                    {popupImageBase64 ? (
                      <div className="relative h-28 bg-contain bg-no-repeat bg-center rounded-lg border bg-slate-100" style={{ backgroundImage: `url(${popupImageBase64})` }}>
                        <button type="button" onClick={() => setPopupImageBase64('')} className="absolute -top-1 -right-1 bg-rose-600 text-white w-5.5 h-5.5 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer shadow-md">&times;</button>
                      </div>
                    ) : (
                      <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold border border-dashed">No custom image uploaded</div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleBase64FileChange(e, setPopupImageBase64)} className="block w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-primary file:text-white cursor-pointer" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Institutional Labeling, Office Seal & Signatures */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-500" /> 7. Institutional Labeling, Office Seal &amp; Principal Signatures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-left">
                <span className="block text-[10px] font-bold text-gray-700 uppercase">Official Institute Seal / Stamp</span>
                {officeSeal ? (
                  <div className="relative h-28 bg-contain bg-no-repeat bg-center rounded-lg border bg-white p-2" style={{ backgroundImage: `url(${officeSeal})` }}>
                    <button type="button" onClick={() => setOfficeSeal('')} className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer shadow-md">&times;</button>
                  </div>
                ) : (
                  <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold border border-dashed text-center p-2">No official seal uploaded</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBase64FileChange(e, setOfficeSeal)} className="block w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-primary file:text-white cursor-pointer" />
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-left">
                <span className="block text-[10px] font-bold text-gray-700 uppercase">HOD / Director Authorized Signature</span>
                {hodSignature ? (
                  <div className="relative h-28 bg-contain bg-no-repeat bg-center rounded-lg border bg-white p-2" style={{ backgroundImage: `url(${hodSignature})` }}>
                    <button type="button" onClick={() => setHodSignature('')} className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer shadow-md">&times;</button>
                  </div>
                ) : (
                  <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold border border-dashed text-center p-2">No signature uploaded</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBase64FileChange(e, setHodSignature)} className="block w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-primary file:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none">
            <Save className="w-4.5 h-4.5 text-secondary" /> Save Live Configurations
          </button>
        </form>
        <div className="mt-6 text-right">
          <button onClick={handleFactoryReset} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow cursor-pointer">
            Reload Defaults from Database
          </button>
        </div>
      </div>
    </div>
  );
};