"use client";

// 모임 목록 Client Component
// Server Component에서 받은 모임 데이터를 표시

import { useState, useMemo } from "react";
import type { Tables } from "@/types/supabase";
import {
  GroupViewToggle,
  type GroupViewMode,
} from "@/components/groups/group-view-toggle";
import { GroupCard } from "@/components/groups/group-card";
import { cn } from "@/lib/utils";

interface GroupsListProps {
  groups: Tables<"groups">[];
  userId: string;
}

export function GroupsList({ groups, userId }: GroupsListProps) {
  const [viewMode, setViewMode] = useState<GroupViewMode>("grid");

  // 각 그룹별 메타 정보 계산
  // TODO: Phase 4에서 멤버 수, 역할, 다음 이벤트 정보 추가
  const groupsWithMeta = useMemo(() => {
    return groups.map((group) => ({
      group: {
        id: group.id,
        name: group.name,
        description: group.description || "",
        image_url: group.image_url,
        invite_code: group.invite_code,
        invite_code_expires_at: group.invite_code_expires_at,
        owner_id: group.owner_id,
        created_at: group.created_at,
      },
      // 임시 메타 정보 (Phase 4에서 실제 데이터로 교체)
      memberCount: 1, // 최소 1명 (본인)
      userRole:
        group.owner_id === userId ? ("owner" as const) : ("member" as const),
      nextEvent: undefined,
    }));
  }, [groups, userId]);

  return (
    <>
      {/* 뷰 토글 */}
      {groups.length > 0 && (
        <GroupViewToggle
          value={viewMode}
          onValueChange={setViewMode}
          className="max-w-xs mb-6"
        />
      )}

      {/* 모임 카드 목록 */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
        )}
      >
        {groupsWithMeta.map(({ group, memberCount, userRole, nextEvent }, index) => (
          <GroupCard
            key={group.id}
            group={group}
            userRole={userRole}
            memberCount={memberCount}
            nextEvent={nextEvent}
            variant={viewMode}
            priority={index === 0} // 첫 번째 이미지 우선 로드 (LCP 최적화)
          />
        ))}
      </div>
    </>
  );
}
