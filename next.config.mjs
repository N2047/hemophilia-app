/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    outputFileTracingIncludes: {
      '/api/**': ['./prisma/dev.db'],
    },
  },
};

export default nextConfig;

