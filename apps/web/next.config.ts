import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Native React <ViewTransition> integration: route changes animate as a "journey".
    viewTransition: true,
  },
};

export default nextConfig;
