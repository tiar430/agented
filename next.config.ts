import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
  },
  // Suppress hydration warnings for development
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Allow dev origins for cross-origin requests
  allowedDevOrigins: [
    'preview-chat-5723768f-72cc-4534-be6c-28e97e496fde.space.z.ai',
    'space.z.ai',
    '*.space.z.ai'
  ],
  // Optimize for mobile
  compress: true,
  // Handle external requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
