import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    "/api/**/*": ["./db/**/*", "./prisma/**/*"],
  },
};

export default nextConfig;
