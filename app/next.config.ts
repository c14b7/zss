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
};

export default nextConfig;
