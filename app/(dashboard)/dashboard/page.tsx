// 대시보드 홈 페이지
// 사용자의 예정된 이벤트, 최근 활동 요약 표시

import { Suspense } from "react";
import { PushNotificationBanner } from "@/components/dashboard/push-notification-banner";
import { BannerCarousel } from "@/components/dashboard/banner-carousel";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements";
import { EventCardSkeletonList } from "@/components/skeletons";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 푸시 알림 배너 */}
      <Suspense fallback={null}>
        <PushNotificationBanner />
      </Suspense>

      {/* 배너 캐러셀 */}
      <BannerCarousel />

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
