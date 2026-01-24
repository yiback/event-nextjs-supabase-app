// 모임 카드 스켈레톤 컴포넌트
// GroupCard의 로딩 상태를 표시

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GroupCardSkeletonProps {
  variant?: "grid" | "list";
  className?: string;
}

export function GroupCardSkeleton({ variant = "grid", className }: GroupCardSkeletonProps) {
  const isListView = variant === "list";

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-lg cursor-pointer overflow-hidden",
        isListView && "flex flex-row",
        className
      )}
    >
      {/* 모임 이미지 */}
      <Skeleton
        className={cn(
          "relative",
          isListView ? "w-24 h-24 shrink-0" : "h-28 sm:h-32 md:h-36 w-full"
        )}
      />

      <div className={cn("flex-1", isListView && "flex flex-col")}>
        <CardHeader className={cn("pb-2", isListView && "py-2 px-3")}>
          {/* 역할 뱃지 + 모임 이름 */}
          <div className="flex items-start justify-between gap-2">
            <Skeleton
              className={cn(
                "flex-1",
                isListView ? "h-5 w-32" : "h-6 md:h-7 w-40"
              )}
            />
            <Skeleton className="h-5 w-12 shrink-0" />
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-2", isListView && "py-1 px-3")}>
          {/* 모임 설명 */}
          {!isListView && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {/* 멤버 수 + 다음 이벤트 */}
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            {/* 멤버 수 */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* 다음 이벤트 */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function GroupCardSkeletonList({ count = 4, variant = "grid" }: { count?: number; variant?: "grid" | "list" }) {
  return (
    <div className={cn(
      variant === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <GroupCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
