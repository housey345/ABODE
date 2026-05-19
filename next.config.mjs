/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.newhomesforsale.co.uk',
      },
    ],
  },
};

export default nextConfig;
