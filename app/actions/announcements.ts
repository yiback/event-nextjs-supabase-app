"use server";

// 공지사항 관련 Server Actions
// 공지사항 CRUD 및 조회 기능

import { createClient } from "@/lib/supabase/server";
import { announcementFormSchema } from "@/lib/schemas/announcements";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import {
  canCreateAnnouncement,
  canManageAnnouncement,
} from "@/lib/utils/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables } from "@/types/supabase";
import type { ActionResult } from "@/types/api";
import type { AnnouncementWithAuthor } from "@/types/database";

/**
 * 공지사항 생성 Server Action
 * @param groupId - 모임 ID
 * @param eventId - 이벤트 ID (선택적, 이벤트 공지일 경우)
 * @param formData - FormData 객체
 * @returns ActionResult - 성공 여부 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 권한 검사 (owner/admin만 가능)
 * 3. Zod 스키마 검증
 * 4. announcements 테이블에 INSERT
 * 5. 캐시 무효화 및 리다이렉트
 */
export async function createAnnouncement(
  groupId: string,
  eventId: string | null,
  formData: FormData
) {
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

    if (!canCreateAnnouncement(userRole)) {
      return {
        success: false,
        error: "공지 작성 권한이 없습니다 (모임장 또는 관리자만 가능)",
      };
    }

    // 3. FormData 파싱
    const rawData = {
      title: formData.get("title"),
      content: formData.get("content"),
    };

    // 4. Zod 스키마 검증
    const validated = announcementFormSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "유효성 검증에 실패했습니다",
      };
    }

    // 5. announcements 테이블에 INSERT
    const { error: insertError } = await supabase.from("announcements").insert({
      group_id: groupId,
      event_id: eventId,
      title: validated.data.title,
      content: validated.data.content,
      author_id: user.id,
    });

    if (insertError) {
      console.error("announcements INSERT 오류:", insertError);
      throw insertError;
    }

    // 6. 캐시 무효화
    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/groups/${groupId}/announcements`);
    if (eventId) {
      revalidatePath(`/groups/${groupId}/events/${eventId}`);
    }
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("createAnnouncement 오류:", error);
    return {
      success: false,
      error: "공지사항 생성 중 오류가 발생했습니다",
    };
  }

  // 7. 공지사항 목록 페이지로 리다이렉트
  redirect(`/groups/${groupId}/announcements`);
}

/**
 * 모임의 공지사항 목록 조회
 * @param groupId - 모임 ID
 * @param limit - 최대 개수 (선택적)
 * @returns AnnouncementWithAuthor[] - 공지사항 목록
 */
export async function getAnnouncementsForGroup(
  groupId: string,
  limit?: number
): Promise<AnnouncementWithAuthor[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getAnnouncementsForGroup: 로그인되지 않은 사용자");
      return [];
    }

    // 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(groupId, user.id);
    if (!userRole) {
      console.log("getAnnouncementsForGroup: 사용자가 해당 모임의 멤버가 아님");
      return [];
    }

    // announcements 테이블 조회 (작성자 정보 JOIN)
    let query = supabase
      .from("announcements")
      .select(
        `
        *,
        author:profiles!announcements_author_id_fkey (
          id,
          full_name,
          avatar_url,
          email,
          created_at
        )
      `
      )
      .eq("group_id", groupId)
      .is("event_id", null) // 모임 공지만 (이벤트 공지 제외)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getAnnouncementsForGroup 오류:", error);
      return [];
    }

    // 타입 변환
    return (data || []).map((item) => ({
      ...item,
      author: item.author as Tables<"profiles">,
    })) as AnnouncementWithAuthor[];
  } catch (error) {
    console.error("getAnnouncementsForGroup 오류:", error);
    return [];
  }
}

/**
 * 이벤트의 공지사항 목록 조회
 * @param eventId - 이벤트 ID
 * @returns AnnouncementWithAuthor[] - 공지사항 목록
 */
export async function getAnnouncementsForEvent(
  eventId: string
): Promise<AnnouncementWithAuthor[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getAnnouncementsForEvent: 로그인되지 않은 사용자");
      return [];
    }

    // 이벤트 조회하여 group_id 확인
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("group_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.log("getAnnouncementsForEvent: 이벤트를 찾을 수 없음");
      return [];
    }

    // 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      console.log("getAnnouncementsForEvent: 사용자가 해당 모임의 멤버가 아님");
      return [];
    }

    // announcements 테이블 조회 (작성자 정보 JOIN)
    const { data, error } = await supabase
      .from("announcements")
      .select(
        `
        *,
        author:profiles!announcements_author_id_fkey (
          id,
          full_name,
          avatar_url,
          email,
          created_at
        )
      `
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getAnnouncementsForEvent 오류:", error);
      return [];
    }

    // 타입 변환
    return (data || []).map((item) => ({
      ...item,
      author: item.author as Tables<"profiles">,
    })) as AnnouncementWithAuthor[];
  } catch (error) {
    console.error("getAnnouncementsForEvent 오류:", error);
    return [];
  }
}

/**
 * 공지사항 상세 조회
 * @param announcementId - 공지사항 ID
 * @returns ActionResult<AnnouncementWithAuthor> - 공지사항 정보 또는 에러
 */
export async function getAnnouncementById(
  announcementId: string
): Promise<ActionResult<AnnouncementWithAuthor>> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 공지사항 조회 (작성자 정보 JOIN)
    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .select(
        `
        *,
        author:profiles!announcements_author_id_fkey (
          id,
          full_name,
          avatar_url,
          email,
          created_at
        )
      `
      )
      .eq("id", announcementId)
      .single();

    if (announcementError || !announcement) {
      return { success: false, error: "공지사항을 찾을 수 없습니다" };
    }

    // 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(announcement.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    return {
      success: true,
      data: {
        ...announcement,
        author: announcement.author as Tables<"profiles">,
      } as AnnouncementWithAuthor,
    };
  } catch (error) {
    console.error("getAnnouncementById 오류:", error);
    return {
      success: false,
      error: "공지사항 조회 중 오류가 발생했습니다",
    };
  }
}

/**
 * 공지사항 수정 Server Action
 * @param announcementId - 공지사항 ID
 * @param formData - FormData 객체
 * @returns ActionResult - 성공 여부 또는 에러
 */
export async function updateAnnouncement(
  announcementId: string,
  formData: FormData
) {
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

    // 2. 공지사항 조회
    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", announcementId)
      .single();

    if (announcementError || !announcement) {
      return { success: false, error: "공지사항을 찾을 수 없습니다" };
    }

    groupId = announcement.group_id;

    // 3. 권한 검사
    const userRole = await checkMemberRole(announcement.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    if (!canManageAnnouncement(userRole, announcement.author_id, user.id)) {
      return {
        success: false,
        error: "공지사항 수정 권한이 없습니다",
      };
    }

    // 4. FormData 파싱
    const rawData = {
      title: formData.get("title"),
      content: formData.get("content"),
    };

    // 5. Zod 스키마 검증
    const validated = announcementFormSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "유효성 검증에 실패했습니다",
      };
    }

    // 6. announcements 테이블 UPDATE
    const { error: updateError } = await supabase
      .from("announcements")
      .update({
        title: validated.data.title,
        content: validated.data.content,
      })
      .eq("id", announcementId);

    if (updateError) {
      console.error("announcements UPDATE 오류:", updateError);
      throw updateError;
    }

    // 7. 캐시 무효화
    revalidatePath(`/groups/${announcement.group_id}`);
    revalidatePath(`/groups/${announcement.group_id}/announcements`);
    revalidatePath(`/announcements/${announcementId}`);
    if (announcement.event_id) {
      revalidatePath(
        `/groups/${announcement.group_id}/events/${announcement.event_id}`
      );
    }
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updateAnnouncement 오류:", error);
    return {
      success: false,
      error: "공지사항 수정 중 오류가 발생했습니다",
    };
  }

  // 8. 공지사항 목록 페이지로 리다이렉트
  redirect(`/groups/${groupId}/announcements`);
}

/**
 * 공지사항 삭제 Server Action
 * @param announcementId - 공지사항 ID
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function deleteAnnouncement(announcementId: string) {
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

    // 2. 공지사항 조회
    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", announcementId)
      .single();

    if (announcementError || !announcement) {
      return { success: false, error: "공지사항을 찾을 수 없습니다" };
    }

    groupId = announcement.group_id;

    // 3. 권한 검사
    const userRole = await checkMemberRole(announcement.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    if (!canManageAnnouncement(userRole, announcement.author_id, user.id)) {
      return {
        success: false,
        error: "공지사항 삭제 권한이 없습니다",
      };
    }

    // 4. announcements 테이블 DELETE
    const { error: deleteError } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId);

    if (deleteError) {
      console.error("announcements DELETE 오류:", deleteError);
      throw deleteError;
    }

    // 5. 캐시 무효화
    revalidatePath(`/groups/${announcement.group_id}`);
    revalidatePath(`/groups/${announcement.group_id}/announcements`);
    if (announcement.event_id) {
      revalidatePath(
        `/groups/${announcement.group_id}/events/${announcement.event_id}`
      );
    }
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("deleteAnnouncement 오류:", error);
    return {
      success: false,
      error: "공지사항 삭제 중 오류가 발생했습니다",
    };
  }

  // 6. 공지사항 목록 페이지로 리다이렉트
  redirect(`/groups/${groupId}/announcements`);
}

/**
 * 최근 공지사항 목록 조회 (대시보드용)
 * 현재 사용자가 속한 모든 모임의 최근 공지사항 반환
 * @param limit - 최대 개수 (기본값: 5)
 * @returns AnnouncementWithAuthor[] - 공지사항 목록
 */
export async function getRecentAnnouncements(
  limit: number = 5
): Promise<(AnnouncementWithAuthor & { groupName?: string })[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getRecentAnnouncements: 로그인되지 않은 사용자");
      return [];
    }

    // 사용자가 속한 모임 ID 목록 조회
    const { data: memberships, error: membershipError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (membershipError || !memberships || memberships.length === 0) {
      console.log("getRecentAnnouncements: 사용자가 속한 모임이 없음");
      return [];
    }

    const groupIds = memberships.map((m) => m.group_id);

    // 해당 모임들의 공지사항 조회 (작성자 정보 + 모임 이름 JOIN)
    const { data, error } = await supabase
      .from("announcements")
      .select(
        `
        *,
        author:profiles!announcements_author_id_fkey (
          id,
          full_name,
          avatar_url,
          email,
          created_at
        ),
        group:groups!announcements_group_id_fkey (
          name
        )
      `
      )
      .in("group_id", groupIds)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getRecentAnnouncements 오류:", error);
      return [];
    }

    // 타입 변환 및 모임 이름 추가
    return (data || []).map((item) => ({
      ...item,
      author: item.author as Tables<"profiles">,
      groupName: (item.group as { name: string } | null)?.name,
    })) as (AnnouncementWithAuthor & { groupName?: string })[];
  } catch (error) {
    console.error("getRecentAnnouncements 오류:", error);
    return [];
  }
}
