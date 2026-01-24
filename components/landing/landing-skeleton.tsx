// 랜딩 페이지 스켈레톤 컴포넌트
// 동적 임포트 로딩 중 표시되는 UI

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 랜딩 콘텐츠 로딩 스켈레톤
 * framer-motion 컴포넌트가 로드되는 동안 표시
 */
export function LandingContentSkeleton() {
  return (
    <>
      {/* 히어로 섹션 스켈레톤 */}
      <section className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        <Skeleton className="h-12 w-72 mb-4" />
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-6 w-96 mt-6" />
        <Skeleton className="h-6 w-80 mt-2" />
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-24" />
        </div>
      </section>

      {/* 기능 소개 섹션 스켈레톤 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <Skeleton className="h-9 w-32 mx-auto mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 bg-background rounded-lg border"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 스켈레톤 */}
      <section className="py-16 px-4">
        <div className="container text-center">
          <Skeleton className="h-9 w-56 mx-auto mb-4" />
          <Skeleton className="h-5 w-72 mx-auto mb-2" />
          <Skeleton className="h-5 w-64 mx-auto mb-8" />
          <Skeleton className="h-11 w-36 mx-auto" />
        </div>
      </section>
    </>
  );
}

/**
 * FeaturePreview 로딩 스켈레톤
 */
export function FeaturePreviewSkeleton() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-48 mx-auto mb-3" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background rounded-lg border p-6 space-y-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
