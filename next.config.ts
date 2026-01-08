import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cdn.bubble.io" }, // Allow all Bubble CDN subdomains
      { protocol: "https", hostname: "d1muf25xaso8hp.cloudfront.net" },
    ],
  },
};

export default nextConfig;
