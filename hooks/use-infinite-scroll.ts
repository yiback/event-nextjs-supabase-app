"use client";

// 무한 스크롤 커스텀 훅 (SWR 기반)
// useSWRInfinite + IntersectionObserver 활용

import { useEffect, useRef, useCallback } from "react";
import useSWRInfinite from "swr/infinite";

/**
 * 페이지네이션 결과 타입
 */
interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
}

/**
 * 무한 스크롤 옵션
 * @template T - 데이터 타입
 */
interface UseInfiniteScrollOptions<T> {
  /** 고유 키 (SWR 캐시 키로 사용) */
  cacheKey: string;
  /** 데이터를 가져오는 비동기 함수 */
  fetchFn: (cursor?: string) => Promise<PaginatedResult<T>>;
  /** 초기 데이터 (서버에서 전달받은 첫 페이지) */
  initialData?: T[];
  /** 초기 커서 (다음 페이지를 가져오기 위한 시작점) */
  initialCursor?: string;
  /** 초기 hasMore 상태 */
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
  /** 에러 상태 */
  error: Error | undefined;
}

/**
 * 무한 스크롤 커스텀 훅 (SWR 기반)
 *
 * useSWRInfinite를 사용하여 데이터 캐싱과 자동 재검증 지원
 * IntersectionObserver로 스크롤 트리거 자동 감지
 *
 * @example
 * ```tsx
 * const { data, isLoading, hasMore, loadMoreRef } = useInfiniteScroll({
 *   cacheKey: "events-list",
 *   fetchFn: async (cursor) => {
 *     const result = await getEventsPaginated(cursor);
 *     return { data: result.data, nextCursor: result.nextCursor };
 *   },
 *   initialData: serverEvents,
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
  cacheKey,
  fetchFn,
  initialData = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  // IntersectionObserver 타겟 ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 커서 저장 (각 페이지의 nextCursor)
  const cursorsRef = useRef<(string | undefined)[]>([undefined]);

  // SWR Infinite 키 생성 함수
  const getKey = (pageIndex: number, previousPageData: PaginatedResult<T> | null) => {
    // 이전 페이지가 없거나 nextCursor가 없으면 마지막
    if (previousPageData && !previousPageData.nextCursor) return null;

    // 이전 페이지의 nextCursor를 현재 페이지의 커서로 저장
    if (previousPageData?.nextCursor) {
      cursorsRef.current[pageIndex] = previousPageData.nextCursor;
    }

    // 캐시 키 + 페이지 인덱스로 고유 키 생성
    return [cacheKey, pageIndex, cursorsRef.current[pageIndex]];
  };

  // SWR Infinite fetcher
  const fetcher = async ([, , cursor]: [string, number, string | undefined]) => {
    return fetchFn(cursor);
  };

  // useSWRInfinite 훅 사용
  const {
    data: pages,
    error,
    setSize,
    isLoading,
    isValidating,
    mutate,
  } = useSWRInfinite<PaginatedResult<T>>(getKey, fetcher, {
    // 초기 데이터가 있으면 첫 페이지로 설정
    fallbackData: initialData.length > 0
      ? [{ data: initialData, nextCursor: undefined }]
      : undefined,
    revalidateFirstPage: false, // 첫 페이지 자동 재검증 비활성화
    revalidateOnFocus: false, // 포커스 시 재검증 비활성화
    revalidateOnMount: initialData.length === 0, // 초기 데이터 없을 때만 마운트 시 재검증
    persistSize: true, // 페이지 크기 유지
  });

  // 모든 페이지의 데이터를 하나의 배열로 합침
  const allData = pages ? pages.flatMap((page) => page.data) : initialData;

  // 더 불러올 데이터가 있는지 확인
  const hasMore = pages
    ? pages.length > 0 && !!pages[pages.length - 1]?.nextCursor
    : true;

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (!isLoading && !isValidating && hasMore) {
      setSize((s) => s + 1);
    }
  }, [isLoading, isValidating, hasMore, setSize]);

  /**
   * 데이터 초기화 (새로고침 등)
   */
  const reset = useCallback(() => {
    cursorsRef.current = [undefined];
    setSize(1);
    mutate();
  }, [setSize, mutate]);

  /**
   * 서버에서 최신 데이터를 다시 가져오기 (Pull-to-Refresh용)
   */
  const refresh = useCallback(async () => {
    cursorsRef.current = [undefined];
    await mutate();
  }, [mutate]);

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
    data: allData,
    isLoading: isLoading || isValidating,
    hasMore,
    loadMoreRef,
    reset,
    refresh,
    error,
  };
}

// 레거시 호환을 위한 기본 타입 내보내기
export type { UseInfiniteScrollOptions, UseInfiniteScrollReturn, PaginatedResult };
