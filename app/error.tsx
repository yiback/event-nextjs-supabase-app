"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

/**
 * 클라이언트 에러 바운더리
 * - 페이지 내에서 발생하는 런타임 에러를 처리
 * - 사용자에게 친화적인 에러 메시지 표시
 * - 재시도 또는 홈으로 이동 옵션 제공
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry로 에러 전송
    Sentry.captureException(error, {
      tags: { location: "error-boundary" },
    });
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* 에러 아이콘 */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        {/* 에러 메시지 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            문제가 발생했습니다
          </h1>
          <p className="text-muted-foreground max-w-sm">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          {/* 개발 환경에서만 에러 상세 표시 */}
          {process.env.NODE_ENV === "development" && (
            <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-md font-mono break-all">
              {error.message}
            </p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              홈으로 이동
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
