"use client";

// 모임 카드 컴포넌트
// 모임 목록에서 각 모임을 표시하는 카드

import Link from "next/link";
import Image from "next/image";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Group, Event } from "@/types/database";
import type { Role } from "@/types/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 역할 레이블 매핑
const roleLabels: Record<Role, string> = {
  owner: "모임장",
  admin: "관리자",
  member: "멤버",
};

interface GroupCardProps {
  group: Group;
  userRole: Role;
  memberCount: number;
  nextEvent?: Event;
  variant?: "grid" | "list";
  className?: string;
}

export function GroupCard({
  group,
  userRole,
  memberCount,
  nextEvent,
  variant = "grid",
  className,
}: GroupCardProps) {
  const isListView = variant === "list";

  return (
    <Link href={`/groups/${group.id}`}>
      <Card
        className={cn(
          "transition-shadow hover:shadow-lg cursor-pointer overflow-hidden",
          isListView && "flex flex-row",
          className
        )}
      >
        {/* 모임 이미지 */}
        <div
          className={cn(
            "bg-muted relative",
            isListView ? "w-24 h-24 shrink-0" : "h-28 sm:h-32 md:h-36 w-full"
          )}
        >
          {group.image_url ? (
            <Image
              src={group.image_url}
              alt={group.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Users className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className={cn("flex-1", isListView && "flex flex-col")}>
          <CardHeader className={cn("pb-2", isListView && "py-2 px-3")}>
            {/* 역할 뱃지 + 모임 이름 */}
            <div className="flex items-start justify-between gap-2">
              <CardTitle
                className={cn(
                  "line-clamp-1",
                  isListView ? "text-base" : "text-lg md:text-xl"
                )}
              >
                {group.name}
              </CardTitle>
              <Badge variant={userRole} className="shrink-0">
                {roleLabels[userRole]}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className={cn("space-y-2", isListView && "py-1 px-3")}>
            {/* 모임 설명 */}
            {group.description && !isListView && (
              <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                {group.description}
              </p>
            )}

            {/* 멤버 수 + 다음 이벤트: 모바일 세로, 데스크톱 가로 */}
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              {/* 멤버 수 */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <span>멤버 {memberCount}명</span>
              </div>

              {/* 다음 이벤트 */}
              {nextEvent && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>
                    {format(new Date(nextEvent.event_date), "M월 d일 (E)", {
                      locale: ko,
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
