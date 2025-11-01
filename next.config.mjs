/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Next.js dev indicators
  devIndicators: false,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Socket.io configuration
  serverExternalPackages: ["socket.io"],

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

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
