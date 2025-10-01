import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚨 ignoruje błędy ESLinta przy `next build`
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚨 ignoruje błędy TypeScript przy `next build`
    ignoreBuildErrors: true,
  },
  // PWA Configuration
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  },
  // Dodane nagłówki dla PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
