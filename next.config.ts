import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.grohe.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.santehnika-online.ru',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.ozone.ru',
        pathname: '**',
      },
    ],
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
