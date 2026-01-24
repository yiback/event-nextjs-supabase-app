"use client";

// 전역 Provider 컴포넌트
// SWR 캐싱 설정 및 기타 클라이언트 Provider

import { SWRConfig } from "swr";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * 전역 Provider 래퍼
 * SWR 캐싱 설정을 전역으로 적용
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        // 데이터 갱신 설정
        revalidateOnFocus: false, // 포커스 시 재검증 비활성화 (불필요한 API 호출 방지)
        revalidateOnReconnect: true, // 재연결 시 재검증
        revalidateIfStale: true, // stale 데이터 재검증

        // 자동 재시도 설정
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000, // 5초 간격 재시도

        // 캐시 유지 시간 (dedupe 간격)
        dedupingInterval: 2000, // 2초 내 중복 요청 방지

        // 기본 fetcher 함수
        fetcher: async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) {
            const error = new Error("데이터를 불러오는 데 실패했습니다");
            throw error;
          }
          return res.json();
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
