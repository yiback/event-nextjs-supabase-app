"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * 글로벌 에러 바운더리
 * - 루트 레이아웃 수준에서 발생하는 에러 처리
 * - html, body 태그를 직접 포함해야 함
 * - 최후의 에러 방어선
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry로 에러 전송
    Sentry.captureException(error, {
      tags: { location: "global-error" },
    });
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="antialiased bg-gray-100">
        <div className="mx-auto w-full max-w-[480px] min-h-screen bg-white shadow-sm">
          <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="text-center space-y-6">
              {/* 에러 아이콘 */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* 에러 메시지 */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  심각한 오류가 발생했습니다
                </h1>
                <p className="text-gray-600 max-w-sm">
                  애플리케이션에 예기치 않은 문제가 발생했습니다.
                  페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  다시 시도
                </button>
                {/* 글로벌 에러에서는 Next.js 라우터가 작동하지 않을 수 있어 기본 a 태그 사용 */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  홈으로 이동
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
