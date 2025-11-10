/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Socket.io and AWS SDK configuration
  serverExternalPackages: ["socket.io", "@aws-sdk/client-s3"],

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization configuration for Aroliya with AWS S3 support
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "aroliya.com",
      },
      {
        protocol: "https",
        hostname: "www.aroliya.com",
      },
      // AWS S3 eu-north-1 (Stockholm) support
      {
        protocol: "https",
        hostname: "*.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https", 
        hostname: "aroliya-freelancer-*.s3.eu-north-1.amazonaws.com",
      },
      // Fallback for other AWS regions
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
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
        ],
      },
      // Add headers for optimized images (fixed route)
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Output standalone for better deployment
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;