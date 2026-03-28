import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
