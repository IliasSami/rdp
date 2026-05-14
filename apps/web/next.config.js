/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages aren't pre-compiled — let Next.js transpile them
  transpilePackages: ['@rdp/api', '@rdp/types', '@rdp/utils'],
  experimental: {
    // Lets Server Components import workspace packages cleanly
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'files.yourdomain.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' }, // GBP photos
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
