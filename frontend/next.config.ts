import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/api/stats",
        destination: `${BACKEND_URL}/api/stats`,
      },
      {
        source: "/api/anomalies",
        destination: `${BACKEND_URL}/api/anomalies`,
      },
      {
        source: "/api/anomalies/:path*",
        destination: `${BACKEND_URL}/api/anomalies/:path*`,
      },
      {
        source: "/api/spoofing/:path*",
        destination: `${BACKEND_URL}/api/spoofing/:path*`,
      },
      {
        source: "/api/investigations/:path*",
        destination: `${BACKEND_URL}/api/investigations/:path*`,
      },
      {
        source: "/api/heatmap/:path*",
        destination: `${BACKEND_URL}/api/heatmap/:path*`,
      },
      {
        source: "/api/ais/:path*",
        destination: `${BACKEND_URL}/api/ais/:path*`,
      },
      {
        source: "/api/health",
        destination: `${BACKEND_URL}/api/health`,
      },
    ];
  },
};

export default nextConfig;
