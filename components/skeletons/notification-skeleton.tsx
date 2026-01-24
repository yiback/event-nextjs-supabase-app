// 알림 아이템 스켈레톤 컴포넌트
// NotificationItem의 로딩 상태를 표시

import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="block p-4 border-b last:border-b-0">
      <div className="flex items-start gap-3">
        {/* 알림 아이콘 */}
        <div className="flex-shrink-0 mt-1">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* 알림 내용 */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* 알림 타입 + 읽음 표시 */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>

          {/* 알림 제목 */}
          <Skeleton className="h-5 w-3/4" />

          {/* 알림 메시지 */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* 알림 시간 */}
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}
