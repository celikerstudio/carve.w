import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ai-why: De marketingpagina woont sinds TDR-0007 op /app; /carve stuurt daar
  // permanent (308) heen, want die URL komt terug in oude links en in de App Store-
  // omgeving. Sinds 2026-10-16 gaat alles onder /carve mee, zie hieronder.
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
      // @ai-why: De subpagina's van /carve (vision, roadmap, faq, money, travel, developer,
      // contributing, health) zijn op 2026-10-16 verwijderd: ze verkochten de app van vóór
      // september (XP, geld, reizen). Oude links en gedeelde screenshots komen nu op de
      // marketingpagina uit in plaats van op een 404.
      { source: '/carve/:path*', destination: '/app', permanent: true },
      { source: '/chat', destination: '/', permanent: true },
    ];
  },
  // @ai-why: De artikelpagina leest de `tease` uit het bronbestand (lib/wiki/tease.ts). Bij een
  //   verversing op Vercel draait die pagina als functie, en die krijgt alleen bestanden mee die
  //   hier staan.
  // @ai-sync: lib/wiki/tease.ts
  outputFileTracingIncludes: {
    // Alleen de artikelen, niet de bronteksten in content/wiki/bronnen/ (ruim 800 KB).
    // @ai-gotcha: '/wiki/**' en niet '/wiki/[category]/[slug]'. De sleutel is een glob, en daarin
    //   is [category] een tekenklasse; zo'n sleutel matcht de route nooit (getest 2026-10-16: de
    //   exclude hieronder deed met die sleutel niets).
    '/wiki/**': ['./content/wiki/{nutrition,training,recovery,supplements,mindset}/*.md'],
  },
  // @ai-why: Next volgt het pad in lib/wiki/tease.ts zelf en nam zo de hele map mee, ook de
  //   bronteksten. Die heeft de pagina niet nodig.
  outputFileTracingExcludes: {
    '/wiki/**': ['./content/wiki/bronnen/**', './content/wiki/leerdoelen.yaml'],
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
