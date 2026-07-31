-- Add base64 columns (if missing)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_logo_base64 TEXT,
  ADD COLUMN IF NOT EXISTS hero_bg_image TEXT,
  ADD COLUMN IF NOT EXISTS about_image TEXT,
  ADD COLUMN IF NOT EXISTS contact_image TEXT,
  ADD COLUMN IF NOT EXISTS popup_image_base64 TEXT,
  ADD COLUMN IF NOT EXISTS office_seal_base64 TEXT,
  ADD COLUMN IF NOT EXISTS hod_signature_base64 TEXT;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS photo_base64 TEXT;

-- Drop URL columns (if they exist)
ALTER TABLE public.site_settings
  DROP COLUMN IF EXISTS logo_url,
  DROP COLUMN IF EXISTS hero_bg_url,
  DROP COLUMN IF EXISTS about_image_url,
  DROP COLUMN IF EXISTS contact_image_url,
  DROP COLUMN IF EXISTS popup_image_url,
  DROP COLUMN IF EXISTS office_seal_url,
  DROP COLUMN IF EXISTS hod_signature_url;

ALTER TABLE public.students
  DROP COLUMN IF EXISTS photo_url;

ALTER TABLE public.team_members
  DROP COLUMN IF EXISTS image_url_storage;

ALTER TABLE public.gallery
  DROP COLUMN IF EXISTS storage_url;

ALTER TABLE public.courses
  DROP COLUMN IF EXISTS storage_thumbnail_url;

-- Ensure base64 fields are not null (set empty strings)
UPDATE public.site_settings
SET
  site_logo_base64 = COALESCE(site_logo_base64, ''),
  hero_bg_image = COALESCE(hero_bg_image, ''),
  about_image = COALESCE(about_image, ''),
  contact_image = COALESCE(contact_image, ''),
  popup_image_base64 = COALESCE(popup_image_base64, ''),
  office_seal_base64 = COALESCE(office_seal_base64, ''),
  hod_signature_base64 = COALESCE(hod_signature_base64, '')
WHERE id = 'default';

UPDATE public.students
SET photo_base64 = COALESCE(photo_base64, '');
