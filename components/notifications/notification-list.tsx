"use client";

// 알림 목록 컴포넌트
// 알림 목록 표시 및 전체 읽음 처리 기능

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { NotificationItemWithAction } from "./notification-item-with-action";
import {
  markAllNotificationsAsRead,
} from "@/app/actions/notifications";
import { toast } from "sonner";
import type { Tables } from "@/types/supabase";

interface NotificationListProps {
  notifications: Tables<"notification_logs">[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [isPending, startTransition] = useTransition();
  const [localNotifications, setLocalNotifications] = useState(notifications);

  // 읽지 않은 알림 개수
  const unreadCount = localNotifications.filter((n) => !n.read_at).length;

  // 전체 읽음 처리
  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();

      if (result.success) {
        // 로컬 상태 업데이트
        setLocalNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            read_at: n.read_at || new Date().toISOString(),
          }))
        );
        toast.success("모든 알림을 읽음 처리했습니다");
      } else {
        toast.error(result.error || "읽음 처리에 실패했습니다");
      }
    });
  };

  // 단일 알림 읽음 처리 후 로컬 상태 업데이트
  const handleMarkAsRead = (notificationId: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, read_at: n.read_at || new Date().toISOString() }
          : n
      )
    );
  };

  return (
    <div>
      {/* 전체 읽음 버튼 */}
      {unreadCount > 0 && (
        <div className="flex justify-end p-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : "전체 읽음"}
          </Button>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="divide-y">
        {localNotifications.map((notification) => (
          <NotificationItemWithAction
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
    </div>
  );
}
