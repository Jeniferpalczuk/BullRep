import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    // `next build` tries to spawn `tsc` and may fail on some Windows setups
    // due to PowerShell execution policy. Keep type-checking in CI via `tsc --noEmit`.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
