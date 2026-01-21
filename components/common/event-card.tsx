"use client";

// 이벤트 카드 컴포넌트
// EventWithGroup 데이터를 받아 카드 형태로 표시

import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { EventWithGroup } from "@/types/database";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewBadge } from "./new-badge";
import { DeadlineBadge } from "./deadline-badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventWithGroup;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const responseDeadline = event.response_deadline
    ? new Date(event.response_deadline)
    : null;

  return (
    <Link href={`/groups/${event.group_id}/events/${event.id}`}>
      <Card
        className={cn(
          "transition-shadow hover:shadow-lg cursor-pointer",
          className
        )}
      >
        <CardHeader className="pb-3">
          {/* 그룹명 */}
          <Badge variant="outline" className="w-fit mb-2">
            {event.group.name}
          </Badge>

          {/* 제목 + NEW 뱃지 */}
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-semibold line-clamp-2 flex-1">
              {event.title}
            </h3>
            <NewBadge createdAt={new Date(event.created_at)} />
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* 이벤트 날짜 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(eventDate, "M월 d일 (E) HH:mm", { locale: ko })}</span>
          </div>

          {/* 장소 */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {/* 응답 마감일 */}
          {responseDeadline && (
            <div className="flex items-center gap-2">
              <DeadlineBadge deadline={responseDeadline} />
            </div>
          )}

          {/* 참석 현황 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Users className="h-4 w-4" />
            <span>참석 현황 확인하기</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
