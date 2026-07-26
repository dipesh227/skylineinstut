// Load .env.local manually (Node.js doesn't auto‑load it)
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'site-assets';

async function uploadBase64(base64, filename) {
  if (!base64 || !base64.startsWith('data:')) return null;
  const mime = base64.match(/^data:(.*?);base64,/)[1];
  const ext = mime.split('/')[1] || 'png';
  const buffer = Buffer.from(base64.split(',')[1], 'base64');
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename + '.' + ext, buffer, { contentType: mime, upsert: true });
  if (error) {
    console.error(`Upload failed for ${filename}:`, error.message);
    return null;
  }
  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return publicUrl.publicUrl;
}

async function migrate() {
  console.log('Starting migration...');

  const { data: settings } = await supabase.from('site_settings').select('*').single();
  if (settings) {
    const fields = [
      ['site_logo_base64', 'logo_url', 'logo'],
      ['hero_bg_image', 'hero_bg_url', 'hero-bg'],
      ['about_image', 'about_image_url', 'about'],
      ['contact_image', 'contact_image_url', 'contact'],
      ['popup_image_base64', 'popup_image_url', 'popup'],
      ['office_seal_base64', 'office_seal_url', 'seal'],
      ['hod_signature_base64', 'hod_signature_url', 'signature'],
    ];
    const updates = {};
    for (const [base64Col, urlCol, prefix] of fields) {
      if (settings[base64Col]) {
        const url = await uploadBase64(settings[base64Col], prefix);
        if (url) updates[urlCol] = url;
      }
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from('site_settings').update(updates).eq('id', 'default');
      console.log('Site settings updated.');
    }
  }

  const { data: students } = await supabase.from('students').select('id, photo_base64');
  for (const s of students) {
    if (s.photo_base64) {
      const url = await uploadBase64(s.photo_base64, `student-${s.id}`);
      if (url) await supabase.from('students').update({ photo_url: url }).eq('id', s.id);
    }
  }
  console.log('Students done.');

  const { data: team } = await supabase.from('team_members').select('id, image_url');
  for (const m of team) {
    if (m.image_url && m.image_url.startsWith('data:')) {
      const url = await uploadBase64(m.image_url, `team-${m.id}`);
      if (url) await supabase.from('team_members').update({ image_url_storage: url }).eq('id', m.id);
    }
  }

  const { data: gallery } = await supabase.from('gallery').select('id, url');
  for (const g of gallery) {
    if (g.url && g.url.startsWith('data:')) {
      const url = await uploadBase64(g.url, `gallery-${g.id}`);
      if (url) await supabase.from('gallery').update({ storage_url: url }).eq('id', g.id);
    }
  }

  const { data: courses } = await supabase.from('courses').select('id, thumbnail_url');
  for (const c of courses) {
    if (c.thumbnail_url && c.thumbnail_url.startsWith('data:')) {
      const url = await uploadBase64(c.thumbnail_url, `course-${c.id}`);
      if (url) await supabase.from('courses').update({ storage_thumbnail_url: url }).eq('id', c.id);
    }
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);