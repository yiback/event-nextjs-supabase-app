// 이벤트 생성 페이지 (서버 컴포넌트)
// 모임 내 새 이벤트 생성 폼

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { canCreateEvent } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "@/components/events/create-event-form";

interface NewEventPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function NewEventPage({ params }: NewEventPageProps) {
  const { groupId } = await params;
  const supabase = await createClient();

  // 1. 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2. 그룹 정보 조회
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  // 그룹이 없으면 404
  if (groupError || !group) {
    notFound();
  }

  // 3. 권한 검사 (owner/admin만 가능)
  const userRole = await checkMemberRole(groupId, user.id);

  if (!userRole) {
    // 멤버가 아닌 경우
    redirect(`/groups/${groupId}`);
  }

  if (!canCreateEvent(userRole)) {
    // 이벤트 생성 권한이 없는 경우 (member)
    redirect(`/groups/${groupId}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold">새 이벤트 만들기</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-xl mx-auto">
        <CreateEventForm groupId={groupId} groupName={group.name} />
      </main>
    </div>
  );
}
