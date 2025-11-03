/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Next.js dev indicators
  devIndicators: {
    buildActivity: false,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Socket.io configuration
  serverExternalPackages: ["socket.io"],

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization configuration for your domain
  images: {
    domains: ["localhost", "127.0.0.1", "www.aroliya.com", "aroliya.com"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },

  // Body size limit for file uploads
  experimental: {
    serverComponentsExternalPackages: ["@aws-sdk/client-s3"],
  },

  // Output standalone for better AWS deployment
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
