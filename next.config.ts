import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "supabase.skylineimbh.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "www.google.com" },
    ],
  },
};

export default nextConfig;