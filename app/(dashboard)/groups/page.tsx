// 모임 목록 페이지
// 사용자가 가입한 모임 목록 표시 (Server Component)

import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGroupsForUser } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { GroupsList } from "@/components/groups/groups-list";
import { EmptyState } from "@/components/common";

export default async function GroupsPage() {
  // 서버에서 사용자 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미인증 사용자는 로그인 페이지로 리다이렉트
  if (!user) {
    redirect("/auth/login");
  }

  // 서버에서 모임 목록 조회
  const groups = await getGroupsForUser();

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

      {/* 모임 목록 또는 빈 상태 */}
      {groups.length === 0 ? (
        // 빈 상태 UI
        <EmptyState
          icon={Users}
          title="아직 가입한 모임이 없어요"
          description="새로운 모임을 만들거나 초대 코드로 참여해보세요"
          action={{
            label: "첫 모임 만들기",
            href: "/groups/new",
          }}
          className="py-16"
        />
      ) : (
        // 모임 목록 (Client Component로 분리)
        <GroupsList groups={groups} userId={user.id} />
      )}
    </div>
  );
}
