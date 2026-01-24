// 랜딩 페이지 (메인 페이지)
// framer-motion 동적 임포트로 초기 번들 크기 최적화
"use client";

import dynamic from "next/dynamic";
import {
  LandingContentSkeleton,
  FeaturePreviewSkeleton,
} from "@/components/landing/landing-skeleton";

// framer-motion을 사용하는 컴포넌트들을 동적으로 임포트
// SSR을 비활성화하여 hydration 문제 방지
const AnimatedLandingContent = dynamic(
  () =>
    import("@/components/landing/animated-landing-content").then(
      (mod) => mod.AnimatedLandingContent
    ),
  {
    ssr: false,
    loading: () => <LandingContentSkeleton />,
  }
);

const FeaturePreview = dynamic(
  () =>
    import("@/components/landing/feature-preview").then(
      (mod) => mod.FeaturePreview
    ),
  {
    ssr: false,
    loading: () => <FeaturePreviewSkeleton />,
  }
);

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* 히어로 + 기능 소개 + CTA 섹션 (framer-motion 동적 로드) */}
      <AnimatedLandingContent />

      {/* 기능 미리보기 섹션 (framer-motion 동적 로드) */}
      <FeaturePreview />
    </div>
  );
}
