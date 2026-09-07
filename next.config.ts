import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ai-why: /carve was de app-pagina (TDR-0003) en rendert sinds TDR-0005 dezelfde
  // component als /. Twee URL's voor één pagina is dubbele content en een tweede
  // plek om chrome en metadata bij te houden, dus /carve stuurt door. Permanent
  // (308), want de URL komt terug in oude links en in de App Store-omgeving, en
  // die mogen blijven werken. /carve/* (roadmap, faq, ...) blijft ongemoeid.
  // @ai-sync: middleware.ts (redirects naar de marketingpagina wijzen naar /)
  // @ai-sync: app/sitemap.ts (/carve staat er niet meer in)
  async redirects() {
    return [{ source: '/carve', destination: '/', permanent: true }];
  },
  // @ai-tried: transpilePackages voor @celikerstudio/ui — breekt Turbopack subpath exports resolution.
  // Niet nodig: package shipt compiled JS in dist/ sinds v0.2.0.
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
