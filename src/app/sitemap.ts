import { createClient } from '@/utils/supabase/server';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: courses } = await supabase.from('courses').select('slug').eq('is_active', true);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skylineinstitute.co.in';

  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/courses`, lastModified: new Date() },
    { url: `${baseUrl}/gallery`, lastModified: new Date() },
    { url: `${baseUrl}/team`, lastModified: new Date() },
    { url: `${baseUrl}/location`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/verify`, lastModified: new Date() },
  ];

  const coursePages = (courses || []).map(c => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...coursePages];
}