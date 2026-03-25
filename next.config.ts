import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация для Cloudflare
  serverExternalPackages: ['@prisma/client'],
  
  // Улучшенная встряска дерева (Tree Shaking) для иконок
  optimizePackageImports: ['lucide-react'],
  
  // Настройка для работы с изображениями (если используете R2)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

export default nextConfig;
