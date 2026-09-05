import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LayoutWrapper } from '@/components/app/layout-wrapper';
import { AdAttribution } from '@/components/analytics/ad-attribution';
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// @ai-why: Dit is de terugval voor élke route zonder eigen metadata (/support, /login,
// not-found). Hij beloofde tot 2026-09-05 "Your Health & Fitness Knowledge Base" met
// "personalized dashboards" — de wiki en het web-platform, allebei sinds TDR-0005 achter
// een uitgezette vlag. Een terugval die iets belooft dat 404 geeft is dezelfde drift die
// TDR-0003 t/m 0005 op vier andere plekken corrigeerden.
//
// @ai-why: `metadataBase` staat hier omdat `app/opengraph-image.tsx` anders geen absolute
// URL krijgt. Zonder deze regel zet Next een relatief pad in `og:image` en halen Slack,
// iMessage en WhatsApp dat niet op. Je krijgt dan geen fout maar een link zonder
// voorvertoning, en dat ziet er precies zo uit als géén opengraph-image hebben.
//
// @ai-gotcha: `twitter.card` staat op `summary_large_image` zonder eigen
// `twitter-image`-bestand. Dat is bewust: X valt terug op `og:image`, dus één gegenereerd
// beeld bedient beide. Voeg je later tóch een `twitter-image.tsx` toe, dan wint die en
// moet je hem apart bijhouden.
//
// @ai-sync: app/opengraph-image.tsx
// @ai-sync: app/(landing)/page.tsx — dezelfde belofte, per route herhaald
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki'),
  title: 'Carve AI — Fitness Coach',
  description:
    'Logs your food from a photo. Tracks the muscles you are skipping. Built by someone who lost 50kg using it.',
  openGraph: {
    type: 'website',
    siteName: 'Carve',
    url: '/',
    title: 'Carve AI — Fitness Coach',
    description: 'Logs your food from a photo. Tracks the muscles you are skipping.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carve AI — Fitness Coach',
    description: 'Logs your food from a photo. Tracks the muscles you are skipping.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*, user_roles(name)')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0c0e14]`}
      >
        <LayoutWrapper
          isAuthenticated={!!user}
          userEmail={user?.email}
          userName={profile?.display_name || profile?.username || undefined}
          userAvatar={profile?.avatar_image_url || undefined}
          userRole={profile?.user_roles?.name || undefined}
        >
          {children}
        </LayoutWrapper>
        <Toaster theme="dark" position="bottom-right" richColors />
        <AdAttribution />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
