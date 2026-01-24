import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

// 번들 분석 도구 설정 (ANALYZE=true npm run build 로 실행)
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // 보안: X-Powered-By 헤더 제거
  poweredByHeader: false,
  // 압축 활성화 (프로덕션 성능 최적화)
  compress: true,
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

// Sentry 설정
const sentryOptions = {
  // 빌드 시 Source Maps 업로드 (Sentry에서 에러 위치 추적)
  silent: true,
  // 빌드 중 에러 발생 시 빌드 실패하지 않음
  hideSourceMaps: true,
};

// 설정 체인: bundleAnalyzer -> Sentry
export default withSentryConfig(withBundleAnalyzer(nextConfig), sentryOptions);
