/** @type {import('next').NextConfig} */

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/notes/:path*',
        destination: 'https://notesbackend-ohi52wuvfq-uc.a.run.app/api/notes/:path*', // Proxy to Backend for API
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/new',
        permanent: true,
      },
    ];
  },
  
};

export default nextConfig;