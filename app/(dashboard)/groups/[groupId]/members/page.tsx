"use client";

// 멤버 관리 페이지
// 모임 멤버 목록 및 관리 (관리자 전용)

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import {
  mockGroups,
  getMembersForGroup,
  currentUserId,
} from "@/lib/mock/data";
import type { Role } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { InviteCodeSection } from "@/components/groups/invite-code-section";
import { MemberListItem } from "@/components/groups/member-list-item";

export default function MembersPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  // 그룹 데이터 로드
  const group = mockGroups.find((g) => g.id === groupId);

  // 그룹이 없으면 404
  if (!group) {
    notFound();
  }

  // 멤버 목록 및 현재 사용자 역할
  const members = getMembersForGroup(groupId);
  const currentUserMember = members.find((m) => m.user_id === currentUserId);
  const currentUserRole: Role = currentUserMember?.role ?? "member";

  // 역할 변경 핸들러 (Phase 3에서 API 연동 예정)
  const handleRoleChange = (memberId: string, newRole: Role) => {
    console.log("역할 변경:", { memberId, newRole });
    // TODO: Phase 3에서 실제 API 호출로 교체
  };

  // 멤버를 역할 순서대로 정렬 (owner -> admin -> member)
  const roleOrder: Record<Role, number> = {
    owner: 0,
    admin: 1,
    member: 2,
  };
  const sortedMembers = [...members].sort(
    (a, b) => roleOrder[a.role] - roleOrder[b.role]
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 뒤로가기 버튼 */}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/groups/${groupId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          모임으로 돌아가기
        </Link>
      </Button>

      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">멤버 관리</h1>
        <p className="text-muted-foreground mt-1">
          {group.name} · 멤버 {members.length}명
        </p>
      </div>

      {/* 초대 코드 섹션 */}
      <InviteCodeSection inviteCode={group.invite_code} />

      {/* 멤버 목록 */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          멤버 목록
        </h2>

        {members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>아직 멤버가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedMembers.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                currentUserRole={currentUserRole}
                onRoleChange={handleRoleChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
