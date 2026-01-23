// 공지사항 작성 페이지 (서버 컴포넌트 + 클라이언트 폼)
// 모임 공지사항 작성

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { canCreateAnnouncement } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/button";
import { AnnouncementCreateForm } from "./announcement-create-form";

interface NewAnnouncementPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function NewAnnouncementPage({
  params,
}: NewAnnouncementPageProps) {
  const { groupId } = await params;
  const supabase = await createClient();

  // 1. 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2. 그룹 데이터 로드
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // 3. 권한 확인 (owner/admin만 가능)
  const userRole = await checkMemberRole(groupId, user.id);
  if (!userRole || !canCreateAnnouncement(userRole)) {
    redirect(`/groups/${groupId}`);
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}/announcements`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">공지사항 작성</h1>
          <p className="text-sm text-muted-foreground">{group.name}</p>
        </div>
      </div>

      {/* 폼 */}
      <AnnouncementCreateForm groupId={groupId} />
    </div>
  );
}
