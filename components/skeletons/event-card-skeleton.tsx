// 이벤트 카드 스켈레톤 컴포넌트
// EventCard의 로딩 상태를 표시

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function EventCardSkeleton() {
  return (
    <Card className="transition-shadow hover:shadow-lg cursor-pointer">
      <CardHeader className="pb-3">
        {/* 그룹명 뱃지 */}
        <Skeleton className="h-5 w-20 mb-2" />

        {/* 제목 */}
        <div className="flex items-start gap-2">
          <Skeleton className="h-6 sm:h-7 md:h-8 w-3/4 flex-1" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 이벤트 날짜 + 장소 */}
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          {/* 이벤트 날짜 */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* 장소 */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* 응답 마감일 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28" />
        </div>

        {/* 참석 현황 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventCardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
