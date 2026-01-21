"use client";

// 알림 페이지
// 푸시 알림 내역 및 설정

import { Bell } from "lucide-react";
import { currentUserId, getNotificationsForUser } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { toast } from "sonner";

export default function NotificationsPage() {
  // 현재 사용자의 알림 목록 조회
  const notifications = getNotificationsForUser(currentUserId);

  // 전체 읽음 처리 (UI만, 실제 로직은 Phase 3)
  const handleMarkAllAsRead = () => {
    toast.success("모든 알림을 읽음 처리했습니다");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            알림
          </h1>
          <p className="text-muted-foreground mt-1">
            새로운 소식과 알림을 확인하세요
          </p>
        </div>

        {/* 전체 읽음 처리 버튼 */}
        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            전체 읽음
          </Button>
        )}
      </div>

      {/* 알림 목록 */}
      {notifications.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
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
