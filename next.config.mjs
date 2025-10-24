/** @type {import('next').NextConfig} */
const nextConfig = {
  serverComponentsExternalPackages: ["socket.io"],

  experimental: {
    // ✅ Disable the new "N" DevTools icon completely
    showDevTools: false,
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
