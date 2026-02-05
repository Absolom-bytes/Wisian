
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;
