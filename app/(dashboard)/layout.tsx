// (dashboard) 라우트 그룹 레이아웃
// 인증된 사용자 전용 - 미들웨어(middleware.ts)에서 인증 체크 수행

import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

// 헤더 로딩 폴백
function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
      </div>
    </header>
  );
}

// 하단 네비게이션 로딩 폴백
function BottomNavFallback() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            <div className="h-2 w-8 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 체크는 middleware.ts에서 수행
  return (
    <div className="relative min-h-screen bg-background">
      {/* 데스크톱 헤더 */}
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>

      {/* 메인 컨텐츠 영역 */}
      <main className="pt-14 pb-20 md:pb-6">{children}</main>

      {/* 모바일 하단 네비게이션 */}
      <Suspense fallback={<BottomNavFallback />}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
