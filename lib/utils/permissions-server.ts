// 서버 전용 권한 함수
// Supabase 서버 클라이언트를 사용하는 함수들

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/enums";

/**
 * 사용자의 모임 내 역할 조회
 * @param groupId - 모임 ID
 * @param userId - 사용자 ID
 * @returns Role | null - 사용자의 역할 (멤버가 아니면 null)
 *
 * 주의: 이 함수는 서버 컴포넌트에서만 사용 가능합니다.
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
