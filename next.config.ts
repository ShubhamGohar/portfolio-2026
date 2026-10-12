import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  // permanent: true → 308, which clients cache. 307 (permanent: false) is not cached.
  // Host match covers apex if the request reaches Next (Vercel domain redirectStatusCode
  // should also be 308; null currently yields an uncached platform 307).
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'shubhamgohar.com' }],
        destination: 'https://www.shubhamgohar.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
