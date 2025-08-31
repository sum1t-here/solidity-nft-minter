import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bronze-calm-goat-716.mypinata.cloud',
        pathname: '/ipfs/**',
      },
    ],
  },    
};

export default nextConfig;
