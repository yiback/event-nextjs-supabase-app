// 대시보드 홈 페이지
// 사용자의 예정된 이벤트, 최근 활동 요약 표시
// embla-carousel 동적 임포트로 초기 번들 크기 최적화

import { Suspense } from "react";
import { PushNotificationBanner } from "@/components/dashboard/push-notification-banner";
import { DynamicBannerCarousel } from "@/components/dashboard/dynamic-banner-carousel";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements";
import { EventCardSkeletonList } from "@/components/skeletons";
import { BannerCarouselSkeleton } from "@/components/dashboard/carousel-skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 푸시 알림 배너 */}
      <Suspense fallback={null}>
        <PushNotificationBanner />
      </Suspense>

      {/* 배너 캐러셀 (동적 로드) */}
      <Suspense fallback={<BannerCarouselSkeleton />}>
        <DynamicBannerCarousel />
      </Suspense>

      {/* 다가오는 이벤트 */}
      <Suspense fallback={<EventCardSkeletonList count={4} />}>
        <UpcomingEvents />
      </Suspense>

      {/* 최근 공지사항 */}
      <Suspense fallback={<EventCardSkeletonList count={3} />}>
        <RecentAnnouncements />
      </Suspense>
    </div>
  );
}
