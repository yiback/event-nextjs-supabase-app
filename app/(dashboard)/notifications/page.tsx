// 알림 페이지
// 푸시 알림 내역 조회 및 읽음 처리

import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
} from "@/app/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  // 서버에서 알림 데이터 조회
  const [notifications, unreadCount] = await Promise.all([
    getNotificationsForUser(50),
    getUnreadNotificationCount(),
  ]);

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
            <NotificationList notifications={notifications} />
          </CardContent>
        </Card>
      ) : (
        // 빈 상태 UI
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">알림이 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">
            새로운 이벤트나 공지사항이 있으면 알려드릴게요
          </p>
        </div>
      )}
    </div>
  );
}
