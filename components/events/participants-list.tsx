"use client";

// 참석자 목록 컴포넌트
// 이벤트 참석자를 상태별로 그룹화하여 표시

import { useMemo } from "react";
import { Users } from "lucide-react";
import type { ParticipantWithProfile, AttendanceStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttendanceBadge } from "@/components/common/attendance-badge";
import { cn } from "@/lib/utils";

interface ParticipantsListProps {
  participants: ParticipantWithProfile[];
  className?: string;
}

// 상태별 순서 및 레이블
const statusOrder: AttendanceStatus[] = ["attending", "not_attending", "maybe"];
const statusLabels: Record<AttendanceStatus, string> = {
  attending: "참석",
  not_attending: "불참",
  maybe: "미정",
};

export function ParticipantsList({
  participants,
  className,
}: ParticipantsListProps) {
  // 상태별로 참석자 그룹화
  const groupedParticipants = useMemo(() => {
    const grouped: Record<AttendanceStatus, ParticipantWithProfile[]> = {
      attending: [],
      not_attending: [],
      maybe: [],
    };

    participants.forEach((participant) => {
      grouped[participant.status].push(participant);
    });

    return grouped;
  }, [participants]);

  // 참석자가 없는 경우
  if (participants.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-8 text-muted-foreground",
          className
        )}
      >
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>아직 참석 응답이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {statusOrder.map((status) => {
        const group = groupedParticipants[status];

        // 해당 상태의 참석자가 없으면 표시하지 않음
        if (group.length === 0) return null;

        return (
          <div key={status} className="space-y-3">
            {/* 그룹 헤더 */}
            <div className="flex items-center gap-2">
              <AttendanceBadge status={status} />
              <span className="text-sm text-muted-foreground">
                {group.length}명
              </span>
            </div>

            {/* 참석자 목록 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {group.map((participant) => (
                <ParticipantItem
                  key={participant.id}
                  participant={participant}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 개별 참석자 아이템
interface ParticipantItemProps {
  participant: ParticipantWithProfile;
}

function ParticipantItem({ participant }: ParticipantItemProps) {
  const { profile } = participant;

  // 이름에서 이니셜 추출
  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate">{profile.full_name}</span>
    </div>
  );
}
