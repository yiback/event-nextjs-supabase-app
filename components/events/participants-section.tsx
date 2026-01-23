"use client";

// 참가자 목록을 실시간으로 표시하는 래퍼 컴포넌트
// useRealtimeParticipants 훅을 사용하여 Supabase Realtime 구독
// ParticipantsList에 실시간 업데이트된 데이터를 전달

import { Users } from "lucide-react";
import { useRealtimeParticipants } from "@/hooks/use-realtime-participants";
import { ParticipantsList } from "@/components/events/participants-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParticipantWithProfile } from "@/types/database";

interface ParticipantsSectionProps {
  eventId: string;
  initialParticipants: ParticipantWithProfile[];
}

/**
 * 실시간 참가자 목록 섹션
 *
 * @param eventId - 이벤트 ID
 * @param initialParticipants - 서버에서 가져온 초기 참가자 목록
 *
 * @example
 * ```tsx
 * <ParticipantsSection
 *   eventId={event.id}
 *   initialParticipants={participants}
 * />
 * ```
 */
export function ParticipantsSection({
  eventId,
  initialParticipants,
}: ParticipantsSectionProps) {
  // Realtime 훅을 사용하여 참가자 목록 실시간 동기화
  const participants = useRealtimeParticipants(eventId, initialParticipants);

  return (
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
  );
}
