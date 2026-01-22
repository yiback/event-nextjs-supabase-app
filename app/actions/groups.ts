"use server";

// 모임 관련 Server Actions
// Next.js 15 Server Actions - 폼 제출 및 mutations 처리

import { createClient } from "@/lib/supabase/server";
import { groupFormSchema } from "@/lib/schemas/groups";
import { generateInviteCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tables } from "@/types/supabase";

// Server Action 결과 타입
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * 모임 생성 Server Action
 * @param formData - FormData 객체 (name, description)
 * @returns ActionResult<Tables<'groups'>> - 생성된 모임 정보 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인 (getUser로 JWT 검증)
 * 2. Zod 스키마 검증
 * 3. 초대 코드 생성 (8자리 랜덤)
 * 4. groups 테이블에 INSERT
 * 5. group_members 테이블에 owner로 추가
 * 6. 캐시 무효화 및 리다이렉트
 */
export async function createGroup(
  formData: FormData
): Promise<ActionResult<Tables<"groups">>> {
  try {
    // 1. Supabase 클라이언트 생성 (서버 측)
    const supabase = await createClient();

    // 2. 사용자 인증 확인 (JWT 검증)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 3. FormData 파싱
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description") || "",
    };

    // 4. Zod 스키마 검증
    const validated = groupFormSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "유효성 검증에 실패했습니다",
      };
    }

    // 5. 초대 코드 생성 (8자리)
    const inviteCode = generateInviteCode(8);

    // 6. groups 테이블에 INSERT
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: validated.data.name,
        description: validated.data.description,
        owner_id: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (groupError) {
      console.error("groups INSERT 오류:", groupError);
      throw groupError;
    }

    // 7. group_members 테이블에 owner 추가
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      console.error("group_members INSERT 오류:", memberError);
      throw memberError;
    }

    // 8. 캐시 무효화 (모임 목록 재로드)
    revalidatePath("/groups");

    // 9. 모임 목록 페이지로 리다이렉트
    redirect("/groups");
  } catch (error) {
    console.error("createGroup 오류:", error);
    return {
      success: false,
      error: "모임 생성 중 오류가 발생했습니다",
    };
  }
}

/**
 * 현재 사용자가 속한 모임 목록 조회
 * @returns Tables<'groups'>[] - 사용자가 속한 모임 배열
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. group_members 테이블에서 user_id로 필터링
 * 3. groups 테이블과 JOIN하여 모임 정보 조회
 * 4. 생성일 역순으로 정렬하여 반환
 */
export async function getGroupsForUser(): Promise<Tables<"groups">[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getGroupsForUser: 로그인되지 않은 사용자");
      return [];
    }

    // group_members 테이블과 groups 테이블 JOIN 조회
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
          created_at
        )
      `
      )
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("getGroupsForUser 오류:", error);
      return [];
    }

    // data의 타입이 { groups: any }[] 형태 (Supabase JOIN 결과)
    // null이 아닌 groups만 필터링하여 반환
    const groups: Tables<"groups">[] = [];

    for (const item of data) {
      const group = item.groups;
      if (group && typeof group === "object" && !Array.isArray(group)) {
        groups.push(group as unknown as Tables<"groups">);
      }
    }

    // 생성일 역순 정렬
    groups.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return groups;
  } catch (error) {
    console.error("getGroupsForUser 오류:", error);
    return [];
  }
}

/**
 * 초대 코드로 모임 가입 Server Action
 * @param inviteCode - 초대 코드 (8자리, 대소문자 무관)
 * @returns ActionResult<Tables<'groups'>> - 가입한 모임 정보 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 초대 코드로 groups 테이블 조회 (대소문자 무관)
 * 3. 이미 멤버인지 확인
 * 4. group_members 테이블에 role='member'로 INSERT
 * 5. 캐시 무효화
 */
export async function joinGroupByCode(
  inviteCode: string
): Promise<ActionResult<Tables<"groups">>> {
  try {
    // 1. Supabase 클라이언트 생성
    const supabase = await createClient();

    // 2. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 3. 초대 코드로 모임 조회 (대소문자 무관)
    const normalizedCode = inviteCode.trim().toUpperCase();

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", normalizedCode)
      .single();

    if (groupError || !group) {
      console.error("groups 조회 오류:", groupError);
      return {
        success: false,
        error: "유효하지 않은 초대 코드입니다",
      };
    }

    // 4. 이미 멤버인지 확인
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      return {
        success: false,
        error: "이미 가입된 모임입니다",
      };
    }

    // 5. group_members 테이블에 member 역할로 추가
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: "member",
      });

    if (memberError) {
      console.error("group_members INSERT 오류:", memberError);
      throw memberError;
    }

    // 6. 캐시 무효화
    revalidatePath("/groups");

    return {
      success: true,
      data: group,
    };
  } catch (error) {
    console.error("joinGroupByCode 오류:", error);
    return {
      success: false,
      error: "모임 가입 중 오류가 발생했습니다",
    };
  }
}

/**
 * 모임 정보 수정 Server Action
 * @param groupId - 수정할 모임 ID
 * @param formData - FormData 객체 (name, description)
 * @returns ActionResult<Tables<'groups'>> - 수정된 모임 정보 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 사용자의 권한 확인 (owner 또는 admin)
 * 3. Zod 스키마 검증
 * 4. groups 테이블 UPDATE
 * 5. 캐시 무효화 및 리다이렉트
 */
export async function updateGroup(
  groupId: string,
  formData: FormData
): Promise<ActionResult<Tables<"groups">>> {
  try {
    // 1. Supabase 클라이언트 생성
    const supabase = await createClient();

    // 2. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 3. 사용자의 권한 확인 (owner 또는 admin)
    const { data: member, error: memberError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: "해당 모임의 멤버가 아닙니다",
      };
    }

    if (!["owner", "admin"].includes(member.role)) {
      return {
        success: false,
        error: "수정 권한이 없습니다 (모임장 또는 관리자만 가능)",
      };
    }

    // 4. FormData 파싱
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description") || "",
    };

    // 5. Zod 스키마 검증
    const validated = groupFormSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "유효성 검증에 실패했습니다",
      };
    }

    // 6. groups 테이블 UPDATE
    const { data: group, error: updateError } = await supabase
      .from("groups")
      .update({
        name: validated.data.name,
        description: validated.data.description,
      })
      .eq("id", groupId)
      .select()
      .single();

    if (updateError) {
      console.error("groups UPDATE 오류:", updateError);
      throw updateError;
    }

    // 7. 캐시 무효화
    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);

    // 8. 모임 상세 페이지로 리다이렉트
    redirect(`/groups/${groupId}`);
  } catch (error) {
    console.error("updateGroup 오류:", error);
    return {
      success: false,
      error: "모임 수정 중 오류가 발생했습니다",
    };
  }
}

/**
 * 모임 삭제 Server Action
 * @param groupId - 삭제할 모임 ID
 * @returns ActionResult<void> - 성공 여부 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 사용자의 권한 확인 (owner만 가능)
 * 3. groups 테이블 DELETE (CASCADE로 group_members도 자동 삭제)
 * 4. 캐시 무효화 및 리다이렉트
 */
export async function deleteGroup(
  groupId: string
): Promise<ActionResult<void>> {
  try {
    // 1. Supabase 클라이언트 생성
    const supabase = await createClient();

    // 2. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 3. 사용자의 권한 확인 (owner만 가능)
    const { data: member, error: memberError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: "해당 모임의 멤버가 아닙니다",
      };
    }

    if (member.role !== "owner") {
      return {
        success: false,
        error: "삭제는 모임장만 가능합니다",
      };
    }

    // 4. groups 테이블 DELETE (CASCADE로 group_members도 자동 삭제)
    const { error: deleteError } = await supabase
      .from("groups")
      .delete()
      .eq("id", groupId);

    if (deleteError) {
      console.error("groups DELETE 오류:", deleteError);
      throw deleteError;
    }

    // 5. 캐시 무효화
    revalidatePath("/groups");

    // 6. 모임 목록 페이지로 리다이렉트
    redirect("/groups");
  } catch (error) {
    console.error("deleteGroup 오류:", error);
    return {
      success: false,
      error: "모임 삭제 중 오류가 발생했습니다",
    };
  }
}
