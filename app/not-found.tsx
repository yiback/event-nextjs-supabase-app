import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * 404 페이지 - 존재하지 않는 경로 접근 시 표시
 * - 사용자 친화적인 메시지
 * - 홈 또는 이전 페이지 이동 옵션
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* 404 아이콘 */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* 404 메시지 */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-muted-foreground max-w-sm">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="default" asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              홈으로 이동
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              대시보드로 이동
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
