"use client";

// 이벤트 상세 페이지
// 이벤트 정보, 참석자 목록, 참석 응답 관리

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
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
} from "lucide-react";
import {
  mockEvents,
  mockGroups,
  getParticipantsForEvent,
  currentUserId,
} from "@/lib/mock/data";
import type { AttendanceStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageCarousel } from "@/components/events/image-carousel";
import { AttendanceButtons } from "@/components/events/attendance-buttons";
import { ParticipantsList } from "@/components/events/participants-list";
import { DeadlineBadge } from "@/components/common/deadline-badge";

export default function EventDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  // 이벤트 데이터 로드
  const event = mockEvents.find(
    (e) => e.id === eventId && e.group_id === groupId
  );

  // 그룹 데이터 로드
  const group = mockGroups.find((g) => g.id === groupId);

  // 이벤트 또는 그룹이 없으면 404
  if (!event || !group) {
    notFound();
  }

  // 참석자 목록
  const participants = getParticipantsForEvent(eventId);

  // 현재 사용자의 참석 상태
  const currentUserParticipant = participants.find(
    (p) => p.user_id === currentUserId
  );
  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus | null>(
    currentUserParticipant?.status ?? null
  );

  // 참석 상태 변경 핸들러 (mock)
  const handleStatusChange = (status: AttendanceStatus) => {
    setCurrentStatus(status);
    console.log("참석 상태 변경:", status);
    // TODO: 실제 API 연동 시 서버에 저장
  };

  // 이벤트 날짜
  const eventDate = new Date(event.event_date);
  const responseDeadline = event.response_deadline
    ? new Date(event.response_deadline)
    : null;

  // 임시 이미지 (mock)
  const eventImages: string[] = [];

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
        {/* 이미지 캐러셀 */}
        <ImageCarousel images={eventImages} alt={event.title} />

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
              {responseDeadline && (
                <DeadlineBadge deadline={responseDeadline} />
              )}
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
          </CardContent>
        </Card>

        {/* 참석 응답 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">나의 참석 응답</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceButtons
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
            />
            {currentStatus && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                {currentStatus === "attending" && "참석으로 응답했습니다"}
                {currentStatus === "not_attending" && "불참으로 응답했습니다"}
                {currentStatus === "maybe" && "미정으로 응답했습니다"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 참석자 명단 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              참석자 명단 ({participants.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ParticipantsList participants={participants} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
