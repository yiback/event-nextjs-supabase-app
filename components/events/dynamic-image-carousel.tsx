"use client";

// 동적 임포트 래퍼 컴포넌트
// embla-carousel을 동적으로 로드하여 번들 크기 최적화

import dynamic from "next/dynamic";
import { ImageCarouselSkeleton } from "./carousel-skeleton";

// embla-carousel을 사용하는 ImageCarousel 동적 임포트
const ImageCarousel = dynamic(
  () => import("./image-carousel").then((mod) => mod.ImageCarousel),
  {
    ssr: false,
    loading: () => <ImageCarouselSkeleton />,
  }
);

interface DynamicImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

/**
 * 동적으로 로드되는 이미지 캐러셀
 * 서버 컴포넌트에서 사용 가능
 */
export function DynamicImageCarousel({
  images,
  alt,
  className,
}: DynamicImageCarouselProps) {
  return <ImageCarousel images={images} alt={alt} className={className} />;
}
