"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // 새로고침 트리거 임계값 (기본값 80px)
  maxPullDistance?: number; // 최대 당김 거리 (기본값 120px)
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  pullDistance: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Pull-to-Refresh 기능을 제공하는 커스텀 훅
 * 터치 이벤트 기반으로 아래로 당겨서 새로고침 기능 구현
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);

  // 터치 시작 핸들러
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // 스크롤이 최상단에 있을 때만 동작
    if (window.scrollY === 0 && !isRefreshing) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, [isRefreshing]);

  // 터치 이동 핸들러
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;

    // 아래로 당기는 경우만 처리 (deltaY > 0)
    if (deltaY > 0) {
      // 최대값 제한 적용
      const distance = Math.min(deltaY, maxPullDistance);
      setPullDistance(distance);

      // 당기는 동안 스크롤 방지 (threshold 초과 시)
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isRefreshing, maxPullDistance]);

  // 터치 종료 핸들러
  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current || isRefreshing) return;

    isPullingRef.current = false;

    // threshold 초과 시 새로고침 실행
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("새로고침 실패:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // threshold 미달 시 원래 위치로 복귀
      setPullDistance(0);
    }
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  // 이벤트 리스너 등록/해제
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 터치 디바이스 감지
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    containerRef,
  };
}
