"use client";

// 동적 배너 캐러셀 래퍼 컴포넌트
// embla-carousel을 동적으로 로드하여 번들 크기 최적화

import dynamic from "next/dynamic";
import { BannerCarouselSkeleton } from "./carousel-skeleton";

// embla-carousel을 사용하는 BannerCarousel 동적 임포트
const BannerCarousel = dynamic(
  () =>
    import("./banner-carousel").then((mod) => mod.BannerCarousel),
  {
    ssr: false,
    loading: () => <BannerCarouselSkeleton />,
  }
);

/**
 * 동적으로 로드되는 배너 캐러셀
 * 서버 컴포넌트에서 사용 가능
 */
export function DynamicBannerCarousel() {
  return <BannerCarousel />;
}
