"use server";

// 멤버 관리 Server Actions
// 멤버 목록 조회, 역할 변경, 멤버 제거

import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { canChangeRoleTo, canRemoveMember } from "@/lib/utils/permissions";
import { revalidatePath } from "next/cache";
import type { GroupMemberWithProfile } from "@/types/database";
import type { Role } from "@/types/enums";
import type { Tables } from "@/types/supabase";
import type { ActionResult } from "@/types/api";

/**
 * 모임 멤버 목록 조회 (프로필 정보 포함)
 * @param groupId - 모임 ID
 * @returns GroupMemberWithProfile[] - 멤버 목록 (역할 순서: owner → admin → member)
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 사용자가 해당 모임의 멤버인지 확인
 * 3. group_members와 profiles 테이블 JOIN 조회
 * 4. 역할 순서대로 정렬하여 반환
 */
export async function getMembersForGroup(
  groupId: string
): Promise<GroupMemberWithProfile[]> {
  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getMembersForGroup: 로그인되지 않은 사용자");
      return [];
    }

    // 2. 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(groupId, user.id);
    if (!userRole) {
      console.log("getMembersForGroup: 사용자가 해당 모임의 멤버가 아님");
      return [];
    }

    // 3. group_members와 profiles 테이블 JOIN 조회
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        id,
        group_id,
        user_id,
        role,
        joined_at,
        profile:profiles (
          id,
          email,
          full_name,
          avatar_url,
          created_at
        )
      `
      )
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("getMembersForGroup 오류:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // 4. 데이터 타입 변환 및 정렬
    // Supabase의 JOIN 결과를 GroupMemberWithProfile 타입으로 변환
    const members: GroupMemberWithProfile[] = data
      .filter((item) => item.profile && typeof item.profile === "object")
      .map((item) => ({
        id: item.id,
        group_id: item.group_id,
        user_id: item.user_id,
        role: item.role as Role,
        joined_at: item.joined_at,
        profile: Array.isArray(item.profile)
          ? (item.profile[0] as Tables<"profiles">)
          : (item.profile as Tables<"profiles">),
      }));

    // 역할 순서대로 정렬 (owner → admin → member)
    const roleOrder: Record<Role, number> = {
      owner: 1,
      admin: 2,
      member: 3,
    };

    members.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

    return members;
  } catch (error) {
    console.error("getMembersForGroup 오류:", error);
    return [];
  }
}

/**
 * 멤버 역할 변경 Server Action
 * @param groupId - 모임 ID
 * @param memberId - 변경할 멤버의 group_members.id
 * @param newRole - 변경할 역할 ('owner' | 'admin' | 'member')
 * @returns ActionResult<void> - 성공 여부 또는 에러
 *
 * 권한 규칙:
 * - owner만 admin 지정 가능
 * - admin은 member만 변경 가능
 * - owner 역할은 변경 불가
 * - 자신의 역할 변경 불가
 */
export async function updateMemberRole(
  groupId: string,
  memberId: string,
  newRole: Role
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

    // 2. 현재 사용자의 역할 확인
    const currentUserRole = await checkMemberRole(groupId, user.id);
    if (!currentUserRole) {
      return {
        success: false,
        error: "해당 모임의 멤버가 아닙니다",
      };
    }

    // 3. 대상 멤버 정보 조회
    const { data: targetMember, error: targetError } = await supabase
      .from("group_members")
      .select("user_id, role")
      .eq("id", memberId)
      .eq("group_id", groupId)
      .single();

    if (targetError || !targetMember) {
      return {
        success: false,
        error: "대상 멤버를 찾을 수 없습니다",
      };
    }

    // 4. 자신의 역할 변경 불가
    if (targetMember.user_id === user.id) {
      return {
        success: false,
        error: "본인의 역할은 변경할 수 없습니다",
      };
    }

    // 5. 역할 변경 권한 확인
    const targetRole = targetMember.role as Role;
    if (!canChangeRoleTo(currentUserRole, targetRole, newRole)) {
      return {
        success: false,
        error: "해당 역할로 변경할 권한이 없습니다",
      };
    }

    // 6. group_members 테이블 UPDATE
    const { error: updateError } = await supabase
      .from("group_members")
      .update({ role: newRole })
      .eq("id", memberId);

    if (updateError) {
      console.error("updateMemberRole UPDATE 오류:", updateError);
      throw updateError;
    }

    // 7. 캐시 무효화
    revalidatePath(`/groups/${groupId}/members`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateMemberRole 오류:", error);
    return {
      success: false,
      error: "역할 변경 중 오류가 발생했습니다",
    };
  }
}

/**
 * 멤버 제거 (탈퇴/추방) Server Action
 * @param groupId - 모임 ID
 * @param memberId - 제거할 멤버의 group_members.id
 * @returns ActionResult<void> - 성공 여부 또는 에러
 *
 * 권한 규칙:
 * - owner/admin만 가능
 * - owner는 제거 불가
 * - 자신은 제거 불가 (탈퇴는 별도 기능)
 */
export async function removeMember(
  groupId: string,
  memberId: string
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

    // 2. 현재 사용자의 역할 확인
    const currentUserRole = await checkMemberRole(groupId, user.id);
    if (!currentUserRole) {
      return {
        success: false,
        error: "해당 모임의 멤버가 아닙니다",
      };
    }

    // 3. 대상 멤버 정보 조회
    const { data: targetMember, error: targetError } = await supabase
      .from("group_members")
      .select("user_id, role")
      .eq("id", memberId)
      .eq("group_id", groupId)
      .single();

    if (targetError || !targetMember) {
      return {
        success: false,
        error: "대상 멤버를 찾을 수 없습니다",
      };
    }

    // 4. 자신 제거 불가
    if (targetMember.user_id === user.id) {
      return {
        success: false,
        error: "본인은 제거할 수 없습니다. 모임 탈퇴 기능을 이용하세요.",
      };
    }

    // 5. 멤버 제거 권한 확인
    const targetRole = targetMember.role as Role;
    if (!canRemoveMember(currentUserRole, targetRole)) {
      return {
        success: false,
        error: "해당 멤버를 제거할 권한이 없습니다",
      };
    }

    // 6. group_members 테이블 DELETE
    const { error: deleteError } = await supabase
      .from("group_members")
      .delete()
      .eq("id", memberId);

    if (deleteError) {
      console.error("removeMember DELETE 오류:", deleteError);
      throw deleteError;
    }

    // 7. 캐시 무효화
    revalidatePath(`/groups/${groupId}/members`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("removeMember 오류:", error);
    return {
      success: false,
      error: "멤버 제거 중 오류가 발생했습니다",
    };
  }
}
