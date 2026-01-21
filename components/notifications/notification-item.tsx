"use client";

// 알림 아이템 컴포넌트
// 개별 알림을 카드 형식으로 표시

import Link from "next/link";
import { Bell, Calendar, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { NotificationLog, Event } from "@/types/database";
import { cn } from "@/lib/utils";

// 알림 타입별 아이콘 매핑
const notificationIcons = {
  new_event: Calendar,
  reminder: Bell,
  announcement: Megaphone,
};

// 알림 타입별 레이블
const notificationLabels = {
  new_event: "새 이벤트",
  reminder: "리마인더",
  announcement: "공지사항",
};

interface NotificationItemProps {
  notification: NotificationLog;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const isUnread = !notification.read_at;

  // 알림 클릭 시 이동할 URL
  const targetUrl = notification.related_event_id
    ? `/events/${notification.related_event_id}`
    : "/dashboard";

  return (
    <Link href={targetUrl}>
      <div
        className={cn(
          "block p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0",
          isUnread && "bg-blue-50/50"
        )}
      >
        <div className="flex items-start gap-3">
          {/* 알림 아이콘 */}
          <div className="flex-shrink-0 mt-1">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                notification.type === "new_event" && "bg-blue-100 text-blue-600",
                notification.type === "reminder" && "bg-amber-100 text-amber-600",
                notification.type === "announcement" && "bg-purple-100 text-purple-600"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>

          {/* 알림 내용 */}
          <div className="flex-1 min-w-0">
            {/* 알림 타입 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {notificationLabels[notification.type]}
              </span>
              {isUnread && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>

            {/* 알림 제목 */}
            <h3 className="font-medium line-clamp-1 mb-1">
              {notification.title}
            </h3>

            {/* 알림 메시지 */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {notification.message}
            </p>

            {/* 알림 시간 */}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.sent_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
