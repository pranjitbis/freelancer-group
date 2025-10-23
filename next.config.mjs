/** @type {import('next').NextConfig} */
const nextConfig = {
  serverComponentsExternalPackages: ["socket.io"],
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
