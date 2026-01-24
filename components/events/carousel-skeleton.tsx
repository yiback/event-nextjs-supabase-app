// 이미지 캐러셀 스켈레톤 컴포넌트
// 동적 임포트 로딩 중 표시되는 UI

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageCarouselSkeletonProps {
  className?: string;
}

/**
 * 이미지 캐러셀 스켈레톤
 */
export function ImageCarouselSkeleton({ className }: ImageCarouselSkeletonProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <Skeleton className="aspect-video w-full" />
      {/* 이미지 카운터 스켈레톤 */}
      <div className="absolute top-3 right-3">
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      {/* 도트 네비게이션 스켈레톤 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        <Skeleton className="w-4 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
      </div>
    </div>
  );
}
