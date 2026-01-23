"use server";

// 이벤트 참가자 관련 Server Actions
// 참석 응답, 참가자 목록 조회

import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/types/supabase";
import type { ActionResult } from "@/types/api";
import type { AttendanceStatus } from "@/types/enums";
import type { ParticipantWithProfile } from "@/types/database";

/**
 * 이벤트 참석 응답 Server Action
 * @param eventId - 이벤트 ID
 * @param status - 참석 상태 ('attending' | 'not_attending' | 'maybe')
 * @returns ActionResult<Tables<'participants'>> - 참가 정보 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 이벤트 정보 조회 및 모임 멤버 확인
 * 3. 기존 참가 기록 확인 (UPSERT)
 * 4. participants 테이블에 INSERT 또는 UPDATE
 * 5. 캐시 무효화
 */
export async function respondToEvent(
  eventId: string,
  status: AttendanceStatus
): Promise<ActionResult<Tables<"participants">>> {
  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 이벤트 정보 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "이벤트를 찾을 수 없습니다" };
    }

    // 3. 모임 멤버 확인
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    // 4. 응답 마감 확인
    if (event.response_deadline) {
      const deadline = new Date(event.response_deadline);
      if (deadline < new Date()) {
        return { success: false, error: "응답 마감 시간이 지났습니다" };
      }
    }

    // 5. 최대 인원 확인 (참석으로 변경하는 경우)
    if (status === "attending" && event.max_participants) {
      const { count, error: countError } = await supabase
        .from("participants")
        .select("id", { count: "exact" })
        .eq("event_id", eventId)
        .eq("status", "attending")
        .neq("user_id", user.id); // 본인 제외

      if (countError) {
        console.error("참가자 수 조회 오류:", countError);
        throw countError;
      }

      if (count !== null && count >= event.max_participants) {
        return {
          success: false,
          error: `최대 인원(${event.max_participants}명)이 초과되었습니다`,
        };
      }
    }

    // 6. 기존 참가 기록 확인
    const { data: existingParticipant } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();

    let participant: Tables<"participants">;

    if (existingParticipant) {
      // 기존 기록 업데이트
      const { data, error: updateError } = await supabase
        .from("participants")
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq("id", existingParticipant.id)
        .select()
        .single();

      if (updateError || !data) {
        console.error("participants UPDATE 오류:", updateError);
        throw updateError;
      }

      participant = data;
    } else {
      // 새 기록 생성
      const { data, error: insertError } = await supabase
        .from("participants")
        .insert({
          event_id: eventId,
          user_id: user.id,
          status,
        })
        .select()
        .single();

      if (insertError || !data) {
        console.error("participants INSERT 오류:", insertError);
        throw insertError;
      }

      participant = data;
    }

    // 7. 캐시 무효화
    revalidatePath(`/groups/${event.group_id}/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true, data: participant };
  } catch (error) {
    console.error("respondToEvent 오류:", error);
    return {
      success: false,
      error: "참석 응답 중 오류가 발생했습니다",
    };
  }
}

/**
 * 이벤트 참가자 목록 조회 (프로필 정보 포함)
 * @param eventId - 이벤트 ID
 * @returns ParticipantWithProfile[] - 참가자 목록
 */
export async function getParticipantsForEvent(
  eventId: string
): Promise<ParticipantWithProfile[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getParticipantsForEvent: 로그인되지 않은 사용자");
      return [];
    }

    // 이벤트 정보 조회 (권한 확인용)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("group_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.log("getParticipantsForEvent: 이벤트를 찾을 수 없음");
      return [];
    }

    // 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      console.log("getParticipantsForEvent: 사용자가 해당 모임의 멤버가 아님");
      return [];
    }

    // 참가자 목록 조회 (프로필 JOIN)
    const { data, error } = await supabase
      .from("participants")
      .select(
        `
        id,
        event_id,
        user_id,
        status,
        responded_at,
        profile:profiles (
          id,
          email,
          full_name,
          avatar_url,
          created_at
        )
      `
      )
      .eq("event_id", eventId)
      .order("responded_at", { ascending: true });

    if (error) {
      console.error("getParticipantsForEvent 오류:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // 데이터 타입 변환
    const participants: ParticipantWithProfile[] = data
      .filter((item) => item.profile && typeof item.profile === "object")
      .map((item) => ({
        id: item.id,
        event_id: item.event_id,
        user_id: item.user_id,
        status: item.status as AttendanceStatus,
        responded_at: item.responded_at,
        profile: Array.isArray(item.profile)
          ? (item.profile[0] as Tables<"profiles">)
          : (item.profile as Tables<"profiles">),
      }));

    return participants;
  } catch (error) {
    console.error("getParticipantsForEvent 오류:", error);
    return [];
  }
}

/**
 * 현재 사용자의 참석 상태 조회
 * @param eventId - 이벤트 ID
 * @returns AttendanceStatus | null - 참석 상태 (미응답인 경우 null)
 */
export async function getCurrentUserParticipation(
  eventId: string
): Promise<AttendanceStatus | null> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // 참가 기록 조회
    const { data, error } = await supabase
      .from("participants")
      .select("status")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.status as AttendanceStatus;
  } catch (error) {
    console.error("getCurrentUserParticipation 오류:", error);
    return null;
  }
}

/**
 * 이벤트 참석 응답 취소 Server Action
 * @param eventId - 이벤트 ID
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function cancelParticipation(
  eventId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 이벤트 정보 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("group_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "이벤트를 찾을 수 없습니다" };
    }

    // 3. 참가 기록 삭제
    const { error: deleteError } = await supabase
      .from("participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("participants DELETE 오류:", deleteError);
      throw deleteError;
    }

    // 4. 캐시 무효화
    revalidatePath(`/groups/${event.group_id}/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("cancelParticipation 오류:", error);
    return {
      success: false,
      error: "참석 응답 취소 중 오류가 발생했습니다",
    };
  }
}

/**
 * 이벤트 참석 현황 조회 (카운트)
 * @param eventId - 이벤트 ID
 * @returns { attending: number, not_attending: number, maybe: number }
 */
export async function getParticipantCounts(eventId: string): Promise<{
  attending: number;
  not_attending: number;
  maybe: number;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("participants")
      .select("status")
      .eq("event_id", eventId);

    if (error || !data) {
      return { attending: 0, not_attending: 0, maybe: 0 };
    }

    return {
      attending: data.filter((p) => p.status === "attending").length,
      not_attending: data.filter((p) => p.status === "not_attending").length,
      maybe: data.filter((p) => p.status === "maybe").length,
    };
  } catch (error) {
    console.error("getParticipantCounts 오류:", error);
    return { attending: 0, not_attending: 0, maybe: 0 };
  }
}
