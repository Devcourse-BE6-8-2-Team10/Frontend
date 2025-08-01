import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: "http://localhost:8080",
    NEXT_PUBLIC_WEBSOCKET_URL: "http://localhost:8080/chat",
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
