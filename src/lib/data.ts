import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const fetchCourses = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
  return data;
});

export const fetchSettings = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_settings').select('*').single();
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  return data;
});