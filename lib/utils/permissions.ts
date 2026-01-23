// 권한 관련 유틸리티 함수
// 멤버 역할 관리 및 권한 체크

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/enums";

/**
 * 사용자의 모임 내 역할 조회
 * @param groupId - 모임 ID
 * @param userId - 사용자 ID
 * @returns Role | null - 사용자의 역할 (멤버가 아니면 null)
 */
export async function checkMemberRole(
  groupId: string,
  userId: string
): Promise<Role | null> {
  try {
    const supabase = await createClient();

    const { data: member, error } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !member) {
      return null;
    }

    return member.role as Role;
  } catch (error) {
    console.error("checkMemberRole 오류:", error);
    return null;
  }
}

/**
 * 멤버 관리 권한 확인 (owner/admin만 true)
 * @param role - 확인할 역할
 * @returns boolean - 멤버 관리 권한 여부
 */
export function canManageMembers(role: Role): boolean {
  return role === "owner" || role === "admin";
}

/**
 * 역할 변경 가능 여부 확인
 * @param currentRole - 현재 사용자의 역할
 * @param targetRole - 대상 멤버의 현재 역할
 * @param newRole - 변경하려는 역할
 * @returns boolean - 역할 변경 가능 여부
 *
 * 규칙:
 * - owner는 절대 변경 불가
 * - owner만 admin 지정 가능
 * - admin은 member 역할만 변경 가능
 * - 본인 역할 변경 불가 (호출하는 곳에서 체크)
 */
export function canChangeRoleTo(
  currentRole: Role,
  targetRole: Role,
  newRole: Role
): boolean {
  // owner 역할은 절대 변경 불가
  if (targetRole === "owner") {
    return false;
  }

  // owner는 admin/member 모두 변경 가능
  if (currentRole === "owner") {
    return newRole === "admin" || newRole === "member";
  }

  // admin은 member 역할만 변경 가능
  if (currentRole === "admin") {
    return newRole === "member";
  }

  // member는 역할 변경 권한 없음
  return false;
}

/**
 * 멤버 제거 가능 여부 확인
 * @param currentRole - 현재 사용자의 역할
 * @param targetRole - 대상 멤버의 역할
 * @returns boolean - 멤버 제거 가능 여부
 *
 * 규칙:
 * - owner/admin만 가능
 * - owner는 제거 불가
 */
export function canRemoveMember(currentRole: Role, targetRole: Role): boolean {
  // owner나 admin만 멤버 제거 가능
  if (!canManageMembers(currentRole)) {
    return false;
  }

  // owner는 제거 불가
  if (targetRole === "owner") {
    return false;
  }

  return true;
}
