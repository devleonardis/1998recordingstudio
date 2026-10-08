import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static build (apps/web/out) served by Cloudflare Pages: no Node server needed.
  output: "export",
  images: {
    // No image optimization server on a static host.
    unoptimized: true,
  },
  experimental: {
    // Native React <ViewTransition> integration: route changes animate as a "journey".
    viewTransition: true,
  },
};

export default nextConfig;
