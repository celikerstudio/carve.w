import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ai-why: De marketingpagina woont sinds TDR-0007 op /app; /carve stuurt daar
  // permanent (308) heen, want die URL komt terug in oude links en in de App Store-
  // omgeving. /carve/* (roadmap, faq, ...) blijft ongemoeid.
  //
  // @ai-gotcha: Hier stond ook `/ -> /app`. Die is per TDR-0008 weg: `/` is nu de
  // cockpit, en config-redirects komen vóór de middleware. Zou hij blijven staan, dan
  // rendert de homepage nooit en is dat niet te zien aan de code van de pagina zelf.
  // Wie zonder sessie op `/` komt wordt in middleware.ts doorgestuurd, tijdelijk (307)
  // en niet permanent, zodat inloggen daarna wél de cockpit oplevert.
  //
  // @ai-sync: middleware.ts
  // @ai-sync: app/app/page.tsx
  // @ai-sync: app/sitemap.ts (/ staat er niet in, /app wel)
  // @ai-sync: docs/tdr/0008-de-cockpit-is-de-homepage.md
  async redirects() {
    return [
      { source: '/carve', destination: '/app', permanent: true },
      { source: '/chat', destination: '/', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
};

export default nextConfig;
