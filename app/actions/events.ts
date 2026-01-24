"use server";

// 이벤트 관련 Server Actions
// 이벤트 CRUD 및 조회 기능

import { createClient } from "@/lib/supabase/server";
import { eventFormSchema } from "@/lib/schemas/events";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { canCreateEvent, canManageEvent } from "@/lib/utils/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables } from "@/types/supabase";
import type { ActionResult } from "@/types/api";
import type { EventWithGroup } from "@/types/database";
import { sendEventCreatedNotification } from "./notifications";

/**
 * 이벤트 생성 Server Action
 * @param groupId - 모임 ID
 * @param formData - FormData 객체
 * @returns ActionResult<Tables<'events'>> - 생성된 이벤트 정보 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 권한 검사 (owner/admin만 가능)
 * 3. Zod 스키마 검증
 * 4. events 테이블에 INSERT
 * 5. 캐시 무효화 및 리다이렉트
 */
export async function createEvent(groupId: string, formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 권한 검사
    const userRole = await checkMemberRole(groupId, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    if (!canCreateEvent(userRole)) {
      return {
        success: false,
        error: "이벤트 생성 권한이 없습니다 (모임장 또는 관리자만 가능)",
      };
    }

    // 3. FormData 파싱
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || "",
      event_date: formData.get("event_date"),
      location: formData.get("location") || "",
      response_deadline: formData.get("response_deadline") || undefined,
      max_participants: formData.get("max_participants")
        ? Number(formData.get("max_participants"))
        : null,
      cost: formData.get("cost") ? Number(formData.get("cost")) : 0,
    };

    // 4. Zod 스키마 검증
    const validated = eventFormSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "유효성 검증에 실패했습니다",
      };
    }

    // 5. events 테이블에 INSERT
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        group_id: groupId,
        title: validated.data.title,
        description: validated.data.description || null,
        event_date: validated.data.event_date,
        location: validated.data.location || null,
        response_deadline: validated.data.response_deadline || null,
        max_participants: validated.data.max_participants || null,
        cost: validated.data.cost ?? 0,
        created_by: user.id,
        status: "scheduled",
      })
      .select()
      .single();

    if (eventError) {
      console.error("events INSERT 오류:", eventError);
      throw eventError;
    }

    // 6. 푸시 알림 발송 (비동기, 실패해도 메인 작업에 영향 없음)
    sendEventCreatedNotification(event.id, groupId, user.id).catch((err) => {
      console.error("이벤트 생성 알림 발송 실패:", err);
    });

    // 7. 캐시 무효화
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createEvent 오류:", error);
    return {
      success: false,
      error: "이벤트 생성 중 오류가 발생했습니다",
    };
  }

  // 7. 모임 상세 페이지로 리다이렉트 (try-catch 밖에서 호출)
  redirect(`/groups/${groupId}`);
}

/**
 * 모임의 이벤트 목록 조회
 * @param groupId - 모임 ID
 * @returns Tables<'events'>[] - 이벤트 목록
 */
export async function getEventsForGroup(
  groupId: string
): Promise<Tables<"events">[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getEventsForGroup: 로그인되지 않은 사용자");
      return [];
    }

    // 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(groupId, user.id);
    if (!userRole) {
      console.log("getEventsForGroup: 사용자가 해당 모임의 멤버가 아님");
      return [];
    }

    // events 테이블 조회
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("group_id", groupId)
      .order("event_date", { ascending: true });

    if (error) {
      console.error("getEventsForGroup 오류:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("getEventsForGroup 오류:", error);
    return [];
  }
}

/**
 * 이벤트 상세 조회
 * @param eventId - 이벤트 ID
 * @returns ActionResult<Tables<'events'>> - 이벤트 정보 또는 에러
 */
export async function getEventById(
  eventId: string
): Promise<ActionResult<Tables<"events">>> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 이벤트 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "이벤트를 찾을 수 없습니다" };
    }

    // 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error("getEventById 오류:", error);
    return { success: false, error: "이벤트 조회 중 오류가 발생했습니다" };
  }
}

/**
 * 이벤트 수정 Server Action
 * @param eventId - 이벤트 ID
 * @param formData - FormData 객체
 * @returns ActionResult<Tables<'events'>> - 수정된 이벤트 정보 또는 에러
 */
export async function updateEvent(eventId: string, formData: FormData) {
  let groupId: string | null = null;

  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 이벤트 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "이벤트를 찾을 수 없습니다" };
    }

    groupId = event.group_id;

    // 3. 권한 검사
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    if (!canManageEvent(userRole, event.created_by, user.id)) {
      return {
        success: false,
        error: "이벤트 수정 권한이 없습니다",
      };
    }

    // 4. FormData 파싱
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || "",
      event_date: formData.get("event_date"),
      location: formData.get("location") || "",
      response_deadline: formData.get("response_deadline") || undefined,
      max_participants: formData.get("max_participants")
        ? Number(formData.get("max_participants"))
        : null,
      cost: formData.get("cost") ? Number(formData.get("cost")) : 0,
    };

    // 5. Zod 스키마 검증
    const validated = eventFormSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "유효성 검증에 실패했습니다",
      };
    }

    // 6. events 테이블 UPDATE
    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: validated.data.title,
        description: validated.data.description || null,
        event_date: validated.data.event_date,
        location: validated.data.location || null,
        response_deadline: validated.data.response_deadline || null,
        max_participants: validated.data.max_participants || null,
        cost: validated.data.cost ?? 0,
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("events UPDATE 오류:", updateError);
      throw updateError;
    }

    // 7. 캐시 무효화
    revalidatePath(`/groups/${event.group_id}`);
    revalidatePath(`/groups/${event.group_id}/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updateEvent 오류:", error);
    return {
      success: false,
      error: "이벤트 수정 중 오류가 발생했습니다",
    };
  }

  // 8. 이벤트 상세 페이지로 리다이렉트
  redirect(`/groups/${groupId}/events/${eventId}`);
}

/**
 * 이벤트 삭제 Server Action
 * @param eventId - 이벤트 ID
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function deleteEvent(eventId: string) {
  let groupId: string | null = null;

  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 이벤트 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "이벤트를 찾을 수 없습니다" };
    }

    groupId = event.group_id;

    // 3. 권한 검사
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    if (!canManageEvent(userRole, event.created_by, user.id)) {
      return {
        success: false,
        error: "이벤트 삭제 권한이 없습니다",
      };
    }

    // 4. events 테이블 DELETE (CASCADE로 관련 데이터도 자동 삭제)
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      console.error("events DELETE 오류:", deleteError);
      throw deleteError;
    }

    // 5. 캐시 무효화
    revalidatePath(`/groups/${event.group_id}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteEvent 오류:", error);
    return {
      success: false,
      error: "이벤트 삭제 중 오류가 발생했습니다",
    };
  }

  // 6. 모임 상세 페이지로 리다이렉트
  redirect(`/groups/${groupId}`);
}

/**
 * 현재 사용자가 참여 중인 이벤트 목록 조회
 * @returns EventWithGroup[] - 이벤트 목록 (그룹 정보 포함)
 */
export async function getEventsForUser(): Promise<EventWithGroup[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getEventsForUser: 로그인되지 않은 사용자");
      return [];
    }

    // 사용자가 속한 모임의 이벤트 조회 (groups와 JOIN)
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        groups (
          id,
          name,
          description,
          image_url,
          invite_code,
          invite_code_expires_at,
          owner_id,
          created_at,
          events (
            id,
            group_id,
            title,
            description,
            event_date,
            location,
            response_deadline,
            status,
            max_participants,
            cost,
            created_by,
            created_at
          )
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("getEventsForUser 오류:", error);
      return [];
    }

    // 데이터 변환: 그룹별 이벤트를 EventWithGroup 형태로 플랫하게 변환
    const eventsWithGroup: EventWithGroup[] = [];

    for (const item of data || []) {
      const group = item.groups;
      if (!group || typeof group !== "object" || Array.isArray(group)) continue;

      const groupData = group as Tables<"groups"> & {
        events: Tables<"events">[];
      };

      if (groupData.events && Array.isArray(groupData.events)) {
        for (const event of groupData.events) {
          eventsWithGroup.push({
            ...event,
            group: {
              id: groupData.id,
              name: groupData.name,
              description: groupData.description,
              image_url: groupData.image_url,
              invite_code: groupData.invite_code,
              invite_code_expires_at: groupData.invite_code_expires_at,
              owner_id: groupData.owner_id,
              created_at: groupData.created_at,
            },
          });
        }
      }
    }

    // 날짜순 정렬 (가까운 순)
    eventsWithGroup.sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );

    return eventsWithGroup;
  } catch (error) {
    console.error("getEventsForUser 오류:", error);
    return [];
  }
}

/**
 * 다가오는 이벤트 목록 조회 (대시보드용)
 * @param limit - 최대 개수 (기본값: 4)
 * @returns EventWithGroup[] - 예정된 이벤트 목록
 */
export async function getUpcomingEvents(limit: number = 4): Promise<EventWithGroup[]> {
  try {
    const events = await getEventsForUser();
    const now = new Date();

    // 예정된 이벤트만 필터링 (현재 시간 이후)
    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.event_date);
      return eventDate >= now && event.status === "scheduled";
    });

    // 날짜순 정렬 후 limit 적용
    return upcomingEvents.slice(0, limit);
  } catch (error) {
    console.error("getUpcomingEvents 오류:", error);
    return [];
  }
}

/**
 * 이벤트 상태 변경 Server Action
 * @param eventId - 이벤트 ID
 * @param status - 변경할 상태
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function updateEventStatus(
  eventId: string,
  status: "scheduled" | "ongoing" | "completed" | "cancelled"
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

    // 2. 이벤트 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "이벤트를 찾을 수 없습니다" };
    }

    // 3. 권한 검사
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    if (!canManageEvent(userRole, event.created_by, user.id)) {
      return {
        success: false,
        error: "이벤트 상태 변경 권한이 없습니다",
      };
    }

    // 4. 상태 업데이트
    const { error: updateError } = await supabase
      .from("events")
      .update({ status })
      .eq("id", eventId);

    if (updateError) {
      console.error("updateEventStatus UPDATE 오류:", updateError);
      throw updateError;
    }

    // 5. 캐시 무효화
    revalidatePath(`/groups/${event.group_id}`);
    revalidatePath(`/groups/${event.group_id}/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateEventStatus 오류:", error);
    return {
      success: false,
      error: "이벤트 상태 변경 중 오류가 발생했습니다",
    };
  }
}

/**
 * 페이지네이션 결과 타입
 */
interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
}

/**
 * 현재 사용자가 참여 중인 이벤트 목록 조회 (페이지네이션)
 * 무한 스크롤을 위한 커서 기반 페이지네이션
 *
 * @param cursor - 이전 페이지의 마지막 이벤트 ID (선택)
 * @param limit - 한 번에 가져올 개수 (기본값: 10)
 * @returns PaginatedResult<EventWithGroup> - 이벤트 목록 및 다음 커서
 */
export async function getEventsForUserPaginated(
  cursor?: string,
  limit: number = 10
): Promise<PaginatedResult<EventWithGroup>> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getEventsForUserPaginated: 로그인되지 않은 사용자");
      return { data: [] };
    }

    // 사용자가 속한 모임의 이벤트 조회 (groups와 JOIN)
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        groups (
          id,
          name,
          description,
          image_url,
          invite_code,
          invite_code_expires_at,
          owner_id,
          created_at,
          events (
            id,
            group_id,
            title,
            description,
            event_date,
            location,
            response_deadline,
            status,
            max_participants,
            cost,
            created_by,
            created_at
          )
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("getEventsForUserPaginated 오류:", error);
      return { data: [] };
    }

    // 데이터 변환: 그룹별 이벤트를 EventWithGroup 형태로 플랫하게 변환
    const eventsWithGroup: EventWithGroup[] = [];

    for (const item of data || []) {
      const group = item.groups;
      if (!group || typeof group !== "object" || Array.isArray(group)) continue;

      const groupData = group as Tables<"groups"> & {
        events: Tables<"events">[];
      };

      if (groupData.events && Array.isArray(groupData.events)) {
        for (const event of groupData.events) {
          eventsWithGroup.push({
            ...event,
            group: {
              id: groupData.id,
              name: groupData.name,
              description: groupData.description,
              image_url: groupData.image_url,
              invite_code: groupData.invite_code,
              invite_code_expires_at: groupData.invite_code_expires_at,
              owner_id: groupData.owner_id,
              created_at: groupData.created_at,
            },
          });
        }
      }
    }

    // 날짜순 정렬 (가까운 순)
    eventsWithGroup.sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );

    // 커서 기반 필터링
    let filteredEvents = eventsWithGroup;
    if (cursor) {
      const cursorIndex = eventsWithGroup.findIndex((e) => e.id === cursor);
      if (cursorIndex !== -1) {
        filteredEvents = eventsWithGroup.slice(cursorIndex + 1);
      }
    }

    // limit 적용
    const paginatedEvents = filteredEvents.slice(0, limit);

    // 다음 커서 설정 (마지막 이벤트의 ID)
    const nextCursor =
      paginatedEvents.length === limit
        ? paginatedEvents[paginatedEvents.length - 1].id
        : undefined;

    return {
      data: paginatedEvents,
      nextCursor,
    };
  } catch (error) {
    console.error("getEventsForUserPaginated 오류:", error);
    return { data: [] };
  }
}
