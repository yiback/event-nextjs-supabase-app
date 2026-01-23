// 멤버 관리 페이지
// 모임 멤버 목록 및 관리

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMembersForGroup } from "@/app/actions/members";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import type { Role } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { InviteCodeSection } from "@/components/groups/invite-code-section";
import { MemberList } from "@/components/groups/member-list";

/**
 * 멤버 관리 페이지 (Server Component)
 * @param params - groupId를 포함한 동적 라우트 파라미터
 */
export default async function MembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  // 1. 사용자 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // 2. 그룹 정보 조회
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // 3. 현재 사용자의 역할 확인
  const currentUserRole = await checkMemberRole(groupId, user.id);

  if (!currentUserRole) {
    // 멤버가 아니면 모임 상세 페이지로 리다이렉트
    redirect(`/groups/${groupId}`);
  }

  // 4. 멤버 목록 조회
  const members = await getMembersForGroup(groupId);

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
          <MemberList
            groupId={groupId}
            members={members}
            currentUserRole={currentUserRole}
            currentUserId={user.id}
          />
        )}
      </div>
    </div>
  );
}
