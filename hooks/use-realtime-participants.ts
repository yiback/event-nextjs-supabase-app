"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ParticipantWithProfile, Profile } from "@/types/database";

/**
 * 프로필 정보를 Supabase에서 조회하는 헬퍼 함수
 * @param userId - 조회할 사용자 ID
 * @returns Profile 객체 또는 null
 */
async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("프로필 조회 오류:", error);
    return null;
  }

  return data;
}

/**
 * Supabase Realtime을 사용하여 이벤트 참가자 목록을 실시간으로 구독하는 커스텀 훅
 *
 * @param eventId - 이벤트 ID
 * @param initialParticipants - 서버에서 가져온 초기 참가자 목록
 * @returns 실시간 업데이트된 참가자 목록
 *
 * @example
 * ```tsx
 * const participants = useRealtimeParticipants(eventId, initialData);
 * ```
 */
export function useRealtimeParticipants(
  eventId: string,
  initialParticipants: ParticipantWithProfile[]
) {
  const [participants, setParticipants] =
    useState<ParticipantWithProfile[]>(initialParticipants);

  useEffect(() => {
    const supabase = createClient();

    // Realtime 채널 생성 및 구독
    const channel = supabase
      .channel(`participants:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE 모두 감지
          schema: "public",
          table: "participants",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          console.log("Realtime 이벤트 수신:", payload);

          // INSERT: 새 참가자 추가
          if (payload.eventType === "INSERT") {
            const newParticipant = payload.new as ParticipantWithProfile;

            // 프로필 정보를 별도로 fetch (Realtime에서 JOIN 불가)
            const profile = await fetchProfile(newParticipant.user_id);

            if (profile) {
              setParticipants((prev) => [
                ...prev,
                {
                  ...newParticipant,
                  profile,
                },
              ]);
            }
          }

          // UPDATE: 기존 참가자 상태 변경 (예: 참석 응답 변경)
          if (payload.eventType === "UPDATE") {
            const updatedParticipant = payload.new as ParticipantWithProfile;

            setParticipants((prev) =>
              prev.map((p) =>
                p.id === updatedParticipant.id
                  ? {
                      ...p,
                      ...updatedParticipant,
                      // 프로필 정보는 유지 (변경되지 않음)
                      profile: p.profile,
                    }
                  : p
              )
            );
          }

          // DELETE: 참가자 제거
          if (payload.eventType === "DELETE") {
            const deletedParticipant = payload.old as ParticipantWithProfile;

            setParticipants((prev) =>
              prev.filter((p) => p.id !== deletedParticipant.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime 구독 상태 [${eventId}]:`, status);
      });

    // cleanup: 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log(`Realtime 구독 해제 [${eventId}]`);
      channel.unsubscribe();
    };
  }, [eventId]); // eventId가 변경되면 재구독

  return participants;
}
