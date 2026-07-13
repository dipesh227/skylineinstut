import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import LoadingScreen from '@/components/LoadingScreen';
import { Plus_Jakarta_Sans, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300','400','500','600','700'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  style: ['normal','italic'],
  variable: '--font-heading',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400','500','600'],
  variable: '--font-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('meta_title, meta_description, institute_name, site_logo_base64')
    .single();

  const defaultTitle = 'Skyline Institute | Management, Hospitality & Bartending';
  const defaultDesc = 'Official student and registry portal of Skyline Institute. Professional training in Bartending, Flair, Barista, and Management.';
  const title = settings?.meta_title || settings?.institute_name || defaultTitle;
  const description = settings?.meta_description || defaultDesc;

  const icons = settings?.site_logo_base64
    ? [{ rel: 'icon', url: settings.site_logo_base64, type: 'image/png' }]
    : [{ rel: 'icon', url: '/favicon.ico' }];

  return {
    title,
    description,
    keywords: ['Skyline Institute', 'Bartending', 'Hospitality', 'Management', 'Barista', 'Certificate Verification'],
    icons,
    openGraph: { title, description, type: 'website' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="preconnect" href="https://fwekzlrqyqpiaimriwjt.supabase.co" />
        <link rel="dns-prefetch" href="https://fwekzlrqyqpiaimriwjt.supabase.co" />
      </head>
      <body className="min-h-screen bg-white font-sans" suppressHydrationWarning>
        <ToastProvider>
          <Suspense fallback={<LoadingScreen />}>
            {children}
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}