"use client";

// 알림 목록 컴포넌트
// 알림 목록 표시 및 전체 읽음 처리 기능 + 무한 스크롤

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItemWithAction } from "./notification-item-with-action";
import {
  markAllNotificationsAsRead,
  getNotificationsForUserPaginated,
} from "@/app/actions/notifications";
import { toast } from "sonner";
import type { Tables } from "@/types/supabase";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { NotificationSkeleton } from "@/components/skeletons/notification-skeleton";

interface NotificationListProps {
  notifications: Tables<"notification_logs">[];
  initialCursor?: string;
  initialHasMore?: boolean;
}

export function NotificationList({
  notifications: initialNotifications,
  initialCursor,
  initialHasMore = true,
}: NotificationListProps) {
  const [isPending, startTransition] = useTransition();

  // 무한 스크롤 훅
  const { data: notifications, isLoading, hasMore, loadMoreRef } = useInfiniteScroll({
    fetchFn: async (cursor) => {
      const result = await getNotificationsForUserPaginated(cursor, 20);
      return {
        data: result.data,
        nextCursor: result.nextCursor,
      };
    },
    initialData: initialNotifications,
    initialCursor,
    initialHasMore,
  });

  const [localNotifications, setLocalNotifications] = useState(notifications);

  // notifications가 변경되면 localNotifications도 업데이트
  // (무한 스크롤로 새 데이터가 추가될 때)
  useState(() => {
    setLocalNotifications(notifications);
  });

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

  // notifications 변경 시 localNotifications 동기화
  if (notifications.length !== localNotifications.length) {
    setLocalNotifications(notifications);
  }

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

      {/* 로딩 중 스켈레톤 */}
      {isLoading && (
        <div className="divide-y">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      )}

      {/* 무한 스크롤 트리거 */}
      {hasMore && !isLoading && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-8 border-t"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* 더 이상 데이터가 없을 때 */}
      {!hasMore && localNotifications.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-8 border-t">
          모든 알림을 불러왔습니다
        </p>
      )}
    </div>
  );
}
