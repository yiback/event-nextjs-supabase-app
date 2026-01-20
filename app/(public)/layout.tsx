// (public) 라우트 그룹 레이아웃
// 비로그인 사용자가 접근 가능한 공개 페이지용

import { Suspense } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";

// 푸터 로딩 폴백
function FooterFallback() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="h-20 bg-muted animate-pulse rounded" />
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 공개 페이지용 헤더 */}
      <PublicHeader />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1">{children}</main>

      {/* 푸터 */}
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
}
