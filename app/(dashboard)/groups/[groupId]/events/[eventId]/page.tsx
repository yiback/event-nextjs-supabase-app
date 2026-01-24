// 이벤트 상세 페이지 (서버 컴포넌트)
// 이벤트 정보, 참석자 목록, 참석 응답 관리

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Coins,
  Share2,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { canManageEvent } from "@/lib/utils/permissions";
import { getEventImages } from "@/app/actions/event-images";
import {
  getParticipantsForEvent,
  getCurrentUserParticipation,
} from "@/app/actions/participants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DynamicImageCarousel } from "@/components/events/dynamic-image-carousel";
import { EventImageUploader } from "@/components/events/event-image-uploader";
import { AttendanceSection } from "@/components/events/attendance-section";
import { ParticipantsSection } from "@/components/events/participants-section";
import { DeadlineBadge } from "@/components/common/deadline-badge";
import { DeleteEventButton } from "@/components/events/delete-event-button";

interface EventDetailPageProps {
  params: Promise<{
    groupId: string;
    eventId: string;
  }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { groupId, eventId } = await params;
  const supabase = await createClient();

  // 1. 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2. 이벤트 정보 조회
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("group_id", groupId)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // 3. 그룹 정보 조회
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // 4. 권한 확인
  const userRole = await checkMemberRole(groupId, user.id);
  if (!userRole) {
    redirect(`/groups/${groupId}`);
  }

  // 관리 권한 확인
  const canManage = canManageEvent(userRole, event.created_by, user.id);

  // 5. 데이터 조회 (병렬 처리)
  const [eventImages, participants, currentStatus] = await Promise.all([
    getEventImages(eventId),
    getParticipantsForEvent(eventId),
    getCurrentUserParticipation(eventId),
  ]);

  // 이벤트 날짜
  const eventDate = new Date(event.event_date);
  const responseDeadline = event.response_deadline
    ? new Date(event.response_deadline)
    : null;

  // 이미지 URL 배열
  const imageUrls = eventImages.map((img) => img.image_url);

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
          <h1 className="font-semibold truncate flex-1">{event.title}</h1>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* 이미지 캐러셀 (동적 로드) */}
        <DynamicImageCarousel images={imageUrls} alt={event.title} />

        {/* 이벤트 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {group.name}
                </p>
                <CardTitle className="text-xl">{event.title}</CardTitle>
              </div>
              {responseDeadline && <DeadlineBadge deadline={responseDeadline} />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 이벤트 설명 */}
            {event.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {event.description}
              </p>
            )}

            <Separator />

            {/* 상세 정보 */}
            <div className="space-y-3">
              {/* 날짜/시간 */}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>
                  {format(eventDate, "yyyy년 M월 d일 (E) a h:mm", {
                    locale: ko,
                  })}
                </span>
              </div>

              {/* 장소 */}
              {event.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
              )}

              {/* 응답 마감 */}
              {responseDeadline && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    응답 마감:{" "}
                    {format(responseDeadline, "M월 d일 (E) a h:mm", {
                      locale: ko,
                    })}
                  </span>
                </div>
              )}

              {/* 최대 인원 */}
              {event.max_participants && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>최대 {event.max_participants}명</span>
                </div>
              )}

              {/* 비용 */}
              {event.cost > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <Coins className="h-5 w-5 text-muted-foreground" />
                  <span>{event.cost.toLocaleString()}원</span>
                </div>
              )}
            </div>

            {/* 관리자 버튼 영역 */}
            {canManage && (
              <>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/groups/${groupId}/events/${eventId}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      수정
                    </Link>
                  </Button>
                  <DeleteEventButton eventId={eventId} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 참석 응답 섹션 */}
        <AttendanceSection eventId={eventId} initialStatus={currentStatus} />

        {/* 참석자 명단 섹션 (실시간 업데이트) */}
        <ParticipantsSection
          eventId={eventId}
          initialParticipants={participants}
        />

        {/* 이미지 관리 섹션 (관리 권한 있는 경우만) */}
        {canManage && (
          <EventImageUploader
            eventId={eventId}
            groupId={groupId}
            existingImages={eventImages}
            canManage={canManage}
          />
        )}
      </main>
    </div>
  );
}
