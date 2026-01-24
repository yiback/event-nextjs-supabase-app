"use client";

import { Loader2 } from "lucide-react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

/**
 * Pull-to-Refresh 래퍼 컴포넌트
 * 모바일 터치 디바이스에서 아래로 당겨서 새로고침 기능 제공
 */
export function PullToRefresh({
  onRefresh,
  children,
  className,
}: PullToRefreshProps) {
  const { isRefreshing, pullDistance, containerRef } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    maxPullDistance: 120,
  });

  // 당김 진행률 계산 (0~1)
  const progress = Math.min(pullDistance / 80, 1);

  // 인디케이터 표시 여부
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* 새로고침 인디케이터 */}
      {showIndicator && (
        <div
          className="absolute left-0 right-0 top-0 flex justify-center items-center pointer-events-none z-50"
          style={{
            height: `${pullDistance}px`,
            opacity: isRefreshing ? 1 : progress,
            transition: isRefreshing || pullDistance === 0 ? "all 0.3s ease-out" : "none",
          }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2
              className={cn(
                "h-5 w-5",
                isRefreshing && "animate-spin"
              )}
              style={{
                transform: isRefreshing ? "none" : `rotate(${progress * 360}deg)`,
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? "새로고침 중..." : progress >= 1 ? "놓아서 새로고침" : "당겨서 새로고침"}
            </span>
          </div>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 || isRefreshing ? "transform 0.3s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
