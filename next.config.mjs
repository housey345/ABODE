/** @type {import('next').NextConfig} */
const nextConfig = {
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
