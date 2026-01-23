// 공지사항 목록 페이지 (서버 컴포넌트)
// 모임의 모든 공지사항 표시

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { canCreateAnnouncement } from "@/lib/utils/permissions";
import { getAnnouncementsForGroup } from "@/app/actions/announcements";
import { Button } from "@/components/ui/button";
import { AnnouncementCard } from "@/components/announcements/announcement-card";

interface AnnouncementsPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function AnnouncementsPage({
  params,
}: AnnouncementsPageProps) {
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

  // 3. 사용자의 역할 확인
  const userRole = await checkMemberRole(groupId, user.id);
  if (!userRole) {
    redirect("/groups");
  }

  const canCreate = canCreateAnnouncement(userRole);

  // 4. 공지사항 목록 조회
  const announcements = await getAnnouncementsForGroup(groupId);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">공지사항</h1>
            <p className="text-sm text-muted-foreground">{group.name}</p>
          </div>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href={`/groups/${groupId}/announcements/new`}>
              <Plus className="h-4 w-4 mr-2" />
              공지 작성
            </Link>
          </Button>
        )}
      </div>

      {/* 공지사항 목록 */}
      {announcements.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">아직 공지사항이 없습니다</p>
          <p className="text-sm mt-2">
            {canCreate
              ? "첫 공지사항을 작성해보세요!"
              : "관리자가 공지사항을 작성하면 여기에 표시됩니다."}
          </p>
          {canCreate && (
            <Button className="mt-4" asChild>
              <Link href={`/groups/${groupId}/announcements/new`}>
                <Plus className="h-4 w-4 mr-2" />
                첫 공지 작성하기
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
}
