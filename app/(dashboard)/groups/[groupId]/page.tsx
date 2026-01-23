// 모임 상세 페이지 (서버 컴포넌트)
// 모임 정보, 이벤트 목록, 공지사항 표시

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Settings, Users, Calendar, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { getMembersForGroup } from "@/app/actions/members";
import { getEventsForGroup } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupHeader } from "@/components/groups/group-header";
import { InviteCodeSection } from "@/components/groups/invite-code-section";
import { EventCard } from "@/components/common/event-card";

interface GroupDetailPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
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

  // 그룹이 없으면 404
  if (groupError || !group) {
    notFound();
  }

  // 3. 사용자의 역할 확인
  const userRole = await checkMemberRole(groupId, user.id);
  if (!userRole) {
    // 멤버가 아니면 그룹 목록으로 리다이렉트
    redirect("/groups");
  }

  const isAdmin = userRole === "owner" || userRole === "admin";

  // 4. 데이터 병렬 조회
  const [members, events] = await Promise.all([
    getMembersForGroup(groupId),
    getEventsForGroup(groupId),
  ]);

  // 이벤트에 그룹 정보 추가 (EventWithGroup 형태)
  const eventsWithGroup = events.map((event) => ({
    ...event,
    group,
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 모임 헤더 */}
      <GroupHeader group={group} memberCount={members.length} />

      {/* 관리자 영역 (owner/admin만) */}
      {isAdmin && (
        <div className="space-y-4">
          {/* 초대 코드 */}
          <InviteCodeSection inviteCode={group.invite_code} />

          {/* 관리 버튼들 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/groups/${groupId}/members`}>
                <Users className="h-4 w-4 mr-2" />
                멤버 관리
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              모임 설정
            </Button>
          </div>
        </div>
      )}

      {/* 탭: 이벤트 / 공지사항 */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            이벤트 ({eventsWithGroup.length})
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            공지사항
          </TabsTrigger>
        </TabsList>

        {/* 이벤트 탭 */}
        <TabsContent value="events" className="mt-4">
          {eventsWithGroup.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 등록된 이벤트가 없습니다</p>
              {isAdmin && (
                <Button className="mt-4" asChild>
                  <Link href={`/groups/${groupId}/events/new`}>
                    첫 이벤트 만들기
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventsWithGroup.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 공지사항 탭 (추후 구현 예정) */}
        <TabsContent value="announcements" className="mt-4">
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>아직 공지사항이 없습니다</p>
            <p className="text-sm mt-2">공지사항 기능은 곧 추가될 예정입니다</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
