import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  async rewrites() {
    return [
      { source: "/signup", destination: "/sign-up" },
      { source: "/signin", destination: "/sign-in" },
      { source: "/login", destination: "/sign-in" },
    ];
  },
};

export default nextConfig;
