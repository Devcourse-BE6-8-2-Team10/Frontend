import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/team10_bucket/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: "http://localhost:8080",
    // NEXT_PUBLIC_BACKEND_URL: "https://your-production-backend.com", 
    NEXT_PUBLIC_WEBSOCKET_URL: "http://localhost:8080/chat",
    // NEXT_PUBLIC_WEBSOCKET_URL: "wss://your-production-backend.com/chat",
  },
  // WebSocket 연결을 위한 설정
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
