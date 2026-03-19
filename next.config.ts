import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@celikerstudio/ui'],
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
