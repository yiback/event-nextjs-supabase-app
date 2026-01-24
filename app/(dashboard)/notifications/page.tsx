// 알림 페이지
// 푸시 알림 내역 조회 및 읽음 처리 + 무한 스크롤

import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getNotificationsForUserPaginated,
  getUnreadNotificationCount,
} from "@/app/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { EmptyState } from "@/components/common";

export default async function NotificationsPage() {
  // 서버에서 알림 데이터 조회 (첫 페이지 20개)
  const [{ data: notifications, nextCursor }, unreadCount] = await Promise.all([
    getNotificationsForUserPaginated(undefined, 20),
    getUnreadNotificationCount(),
  ]);

  // 다음 페이지가 있는지 여부
  const hasMore = !!nextCursor;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            알림
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-sm px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            새로운 소식과 알림을 확인하세요
          </p>
        </div>
      </div>

      {/* 알림 목록 */}
      {notifications.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <NotificationList
              notifications={notifications}
              initialCursor={nextCursor}
              initialHasMore={hasMore}
            />
          </CardContent>
        </Card>
      ) : (
        // 빈 상태 UI
        <EmptyState
          icon={Bell}
          title="알림이 없습니다"
          description="새로운 이벤트나 공지사항이 있으면 알려드릴게요"
          className="border-2 border-dashed rounded-lg"
        />
      )}
    </div>
  );
}
