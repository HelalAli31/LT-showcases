import type { NextConfig } from "next";
const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "mongodb",
    "@sparticuz/chromium",
    "playwright",
    "playwright-core",
  ],
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./public/fonts/**/*",
      "./public/assets/logo.png",
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
  async headers() {
    return ["/admin/:path*", "/offer/:path*", "/contract-access/:path*"].map(
      (source) => ({
        source,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      }),
    );
  },
};
export default config;
