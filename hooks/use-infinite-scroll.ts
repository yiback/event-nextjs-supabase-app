"use client";

// 무한 스크롤 커스텀 훅
// IntersectionObserver를 활용한 자동 데이터 로딩

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 무한 스크롤 옵션
 * @template T - 데이터 타입
 */
interface UseInfiniteScrollOptions<T> {
  /** 데이터를 가져오는 비동기 함수 */
  fetchFn: (cursor?: string) => Promise<{ data: T[]; nextCursor?: string }>;
  /** 초기 데이터 (서버에서 전달받은 첫 페이지) */
  initialData: T[];
  /** 초기 커서 (다음 페이지를 가져오기 위한 시작점) */
  initialCursor?: string;
  /** 더 가져올 데이터가 있는지 여부 */
  initialHasMore?: boolean;
}

/**
 * 무한 스크롤 반환 타입
 * @template T - 데이터 타입
 */
interface UseInfiniteScrollReturn<T> {
  /** 현재 로드된 모든 데이터 */
  data: T[];
  /** 데이터 로딩 중 여부 */
  isLoading: boolean;
  /** 더 가져올 데이터가 있는지 여부 */
  hasMore: boolean;
  /** IntersectionObserver 타겟 ref (스크롤 트리거) */
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  /** 데이터 초기화 함수 */
  reset: () => void;
  /** 서버에서 최신 데이터를 다시 가져오는 새로고침 함수 */
  refresh: () => Promise<void>;
}

/**
 * 무한 스크롤 커스텀 훅
 *
 * IntersectionObserver를 사용하여 스크롤이 특정 요소에 도달하면
 * 자동으로 다음 데이터를 가져옵니다.
 *
 * @example
 * ```tsx
 * const { data, isLoading, hasMore, loadMoreRef } = useInfiniteScroll({
 *   fetchFn: async (cursor) => {
 *     const result = await getEventsPaginated(cursor);
 *     return { data: result.data, nextCursor: result.nextCursor };
 *   },
 *   initialData: serverEvents,
 *   initialCursor: serverCursor,
 *   initialHasMore: serverHasMore,
 * });
 *
 * return (
 *   <div>
 *     {data.map(item => <ItemCard key={item.id} item={item} />)}
 *     {hasMore && <div ref={loadMoreRef}>로딩 중...</div>}
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll<T>({
  fetchFn,
  initialData,
  initialCursor,
  initialHasMore = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);

  // IntersectionObserver 타겟 ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  /**
   * 다음 페이지 데이터 로드
   */
  const loadMore = useCallback(async () => {
    // 이미 로딩 중이거나 더 이상 데이터가 없으면 중단
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const result = await fetchFn(cursor);

      // 새 데이터 추가
      setData((prev) => [...prev, ...result.data]);

      // 다음 커서 업데이트
      setCursor(result.nextCursor);

      // 더 이상 데이터가 없으면 hasMore = false
      setHasMore(!!result.nextCursor && result.data.length > 0);
    } catch (error) {
      console.error("[useInfiniteScroll] 데이터 로드 실패:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, cursor, fetchFn]);

  /**
   * 데이터 초기화 (새로고침 등)
   */
  const reset = useCallback(() => {
    setData(initialData);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
    setIsLoading(false);
  }, [initialData, initialCursor, initialHasMore]);

  /**
   * 서버에서 최신 데이터를 다시 가져오기 (Pull-to-Refresh용)
   */
  const refresh = useCallback(async () => {
    // 이미 로딩 중이면 중단
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 처음부터 다시 가져오기 (cursor 없음)
      const result = await fetchFn(undefined);

      // 데이터 완전히 교체
      setData(result.data);
      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor && result.data.length > 0);
    } catch (error) {
      console.error("[useInfiniteScroll] 새로고침 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, fetchFn]);

  /**
   * IntersectionObserver 설정
   * 타겟 요소가 뷰포트에 보이면 loadMore 호출
   */
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null, // 뷰포트 기준
        rootMargin: "200px", // 200px 전에 미리 로드 (UX 개선)
        threshold: 0.1, // 10% 보이면 트리거
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  return {
    data,
    isLoading,
    hasMore,
    loadMoreRef,
    reset,
    refresh,
  };
}
