import type { NextConfig } from "next";

// Where the Spring backend lives. The browser always calls the same-origin
// /api/v1/* path; Next.js forwards it to the backend server-side, so the
// backend's CORS allowlist (localhost:3000 only) never gets in the way.
const raw = (process.env.BACKEND_URL ?? "http://localhost:8080").trim();
const BACKEND_URL = (/^https?:\/\//.test(raw) ? raw : `https://${raw}`).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
