"use client";

// 모임 상세 페이지
// 모임 정보, 이벤트 목록, 공지사항 표시

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Settings, Users, Calendar, Megaphone } from "lucide-react";
import {
  mockGroups,
  getMembersForGroup,
  getEventsForGroup,
  mockAnnouncements,
  currentUserId,
} from "@/lib/mock/data";
import type { Role } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupHeader } from "@/components/groups/group-header";
import { InviteCodeSection } from "@/components/groups/invite-code-section";
import { EventCard } from "@/components/common/event-card";

export default function GroupDetailPage() {
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
  const userRole: Role = currentUserMember?.role ?? "member";
  const isAdmin = userRole === "owner" || userRole === "admin";

  // 이벤트 목록 (그룹 정보 포함하여 EventWithGroup 형태로 변환)
  const events = getEventsForGroup(groupId);
  const eventsWithGroup = events.map((event) => ({
    ...event,
    group,
  }));

  // 공지사항 (해당 그룹만 필터링)
  const announcements = mockAnnouncements.filter(
    (a) => a.group_id === groupId
  );

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
            공지사항 ({announcements.length})
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

        {/* 공지사항 탭 */}
        <TabsContent value="announcements" className="mt-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 공지사항이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {announcement.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(announcement.created_at),
                        "yyyy년 M월 d일",
                        { locale: ko }
                      )}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
