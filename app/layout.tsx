import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LayoutWrapper } from '@/components/app/layout-wrapper';
import { CookieConsent } from '@/components/analytics/cookie-consent';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { createClient } from "@/lib/supabase/server";
import { APP_STORE_ID } from "@/lib/utils";
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
  // @ai-why: De smart banner van Safari op iOS. Vrijwel al het verkeer komt via een
  // bio-link op een iPhone binnen, en dit is de enige ingang naar de App Store die
  // bovenaan het scherm staat vóór er gescrold is. Hij stond er niet; gecontroleerd op
  // 2026-09-07 met een grep op `apple-itunes-app` in de productie-HTML van carve.wiki.
  // @ai-gotcha: Alleen Safari op iOS toont hem, en niet in een in-app browser (Instagram,
  // TikTok). Hij vervangt de knoppen in de pagina dus niet, hij komt erbij.
  // @ai-sync: lib/utils.ts (APP_STORE_ID)
  other: {
    'apple-itunes-app': `app-id=${APP_STORE_ID}`,
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
        <CookieConsent />
        {/* @ai-why: Consent Mode moet vóór gtag.js draaien, niet erna. Laadt de tag
            eerst en zetten we daarna pas `denied`, dan zijn de cookies er al en is de
            toestemming juridisch zinloos. Vandaar `beforeInteractive`, wat alleen in
            deze root layout werkt.
            @ai-gotcha: `wait_for_update` geeft de banner 500ms om een opgeslagen keuze
            terug te melden. Haal je dat weg, dan vertrekt de eerste pageview van een
            terugkerende bezoeker nog onder `denied` en mist die in je rapportage.
            @ai-sync: lib/consent.ts
            @ai-sync: components/analytics/cookie-consent.tsx */}
        <Script id="ga-consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('js', new Date());`}
        </Script>
        {/* @ai-why: De tag laadt alleen met een measurement ID. Anders dan bij de
            Plausible-terugval die hier tot 2026-09-08 stond is er bewust géén
            hardgecodeerde waarde: een verkeerd ID vult stilletjes de verkeerde property,
            en dat is erger dan niet meten. Ontbreekt het ID, dan waarschuwt
            lib/analytics.ts bij het eerste event.
            @ai-sync: lib/analytics.ts */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-config" strategy="afterInteractive">
              {`gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
        {/* @ai-why: De Meta-pixel staat hier als component en niet als `<Script>` naast
            de GA-tag hierboven. Google's tag mag altijd laden omdat Consent Mode hem
            vertelt wat hij niet mag opslaan; Meta kent die stand niet en zet zijn cookie
            zodra hij laadt. Hij mag dus pas geïnjecteerd worden nadat er ja is gezegd,
            en dat kan alleen vanuit de client.
            @ai-sync: components/analytics/meta-pixel.tsx */}
        <MetaPixel />
      </body>
    </html>
  );
}
