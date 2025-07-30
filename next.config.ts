import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Optimizar para producción
  compress: true,
  
  // Configurar headers para mejor rendimiento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
