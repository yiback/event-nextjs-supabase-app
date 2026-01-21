"use client";

// 모임 목록 페이지
// 사용자가 가입한 모임 목록 표시

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import {
  getGroupsForUser,
  currentUserId,
  mockGroupMembers,
  mockEvents,
} from "@/lib/mock/data";
import type { Role } from "@/types/enums";
import type { Event } from "@/types/database";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/groups/group-card";
import {
  GroupViewToggle,
  type GroupViewMode,
} from "@/components/groups/group-view-toggle";
import { cn } from "@/lib/utils";

// 다음 이벤트를 찾는 헬퍼 함수 (클라이언트에서만 호출)
function getNextEventForGroup(groupId: string, now: Date): Event | undefined {
  const upcomingEvents = mockEvents
    .filter(
      (e) =>
        e.group_id === groupId &&
        new Date(e.event_date) > now &&
        e.status === "scheduled"
    )
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
  return upcomingEvents[0];
}

export default function GroupsPage() {
  const [viewMode, setViewMode] = useState<GroupViewMode>("grid");
  // 클라이언트 마운트 여부 (hydration 문제 방지)
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 마운트 상태 업데이트
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 더미 데이터에서 현재 사용자의 모임 목록 가져오기
  const groups = getGroupsForUser(currentUserId);

  // 각 그룹별 멤버 수, 역할, 다음 이벤트 계산
  // useMemo로 최적화하고, 날짜 계산은 마운트 후에만 수행
  const groupsWithMeta = useMemo(() => {
    const now = new Date();

    return groups.map((group) => {
      // 해당 그룹의 멤버 수
      const memberCount = mockGroupMembers.filter(
        (m) => m.group_id === group.id
      ).length;

      // 현재 사용자의 역할
      const userMembership = mockGroupMembers.find(
        (m) => m.group_id === group.id && m.user_id === currentUserId
      );
      const userRole: Role = userMembership?.role ?? "member";

      // 다음 이벤트 (클라이언트 마운트 후에만 계산)
      const nextEvent = isMounted
        ? getNextEventForGroup(group.id, now)
        : undefined;

      return {
        group,
        memberCount,
        userRole,
        nextEvent,
      };
    });
  }, [groups, isMounted]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 헤더: 제목 + 모임 생성 버튼 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 모임</h1>
          <p className="text-muted-foreground mt-1">
            가입한 모임 {groups.length}개
          </p>
        </div>
        <Button asChild>
          <Link href="/groups/new">
            <Plus className="h-4 w-4 mr-2" />
            새 모임 만들기
          </Link>
        </Button>
      </div>

      {/* 뷰 토글 */}
      {groups.length > 0 && (
        <GroupViewToggle
          value={viewMode}
          onValueChange={setViewMode}
          className="max-w-xs"
        />
      )}

      {/* 모임 목록 또는 빈 상태 */}
      {groups.length === 0 ? (
        // 빈 상태 UI
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">아직 가입한 모임이 없어요</h3>
          <p className="text-muted-foreground mb-4">
            새로운 모임을 만들거나 초대 코드로 참여해보세요
          </p>
          <Button asChild>
            <Link href="/groups/new">
              <Plus className="h-4 w-4 mr-2" />
              첫 모임 만들기
            </Link>
          </Button>
        </div>
      ) : (
        // 모임 카드 목록
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          )}
        >
          {groupsWithMeta.map(({ group, memberCount, userRole, nextEvent }) => (
            <GroupCard
              key={group.id}
              group={group}
              userRole={userRole}
              memberCount={memberCount}
              nextEvent={nextEvent}
              variant={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
