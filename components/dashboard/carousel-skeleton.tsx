// 캐러셀 스켈레톤 컴포넌트
// 동적 임포트 로딩 중 표시되는 UI

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 배너 캐러셀 스켈레톤
 */
export function BannerCarouselSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <Skeleton className="h-40 md:h-56 w-full" />
      {/* 도트 네비게이션 스켈레톤 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Skeleton className="w-6 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
      </div>
    </div>
  );
}
