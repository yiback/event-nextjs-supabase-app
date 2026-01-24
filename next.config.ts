import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 외부 이미지 도메인 허용
    remotePatterns: [
      // Mock 데이터용
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Supabase Storage (이미지 업로드)
      {
        protocol: "https",
        hostname: "uoiekeszopzpdgjzflvr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
