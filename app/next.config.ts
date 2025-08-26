import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚨 ignoruje błędy ESLinta przy `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
