/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  output: "standalone",
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ['canvas'],
  },
  // Increase API route timeout for long-running operations
  serverRuntimeConfig: {
    // Increase timeout for API routes
    maxDuration: 60,
  },
};

export default nextConfig;
