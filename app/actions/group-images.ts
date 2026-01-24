"use server";

// 그룹 이미지 관련 Server Actions
// 그룹 대표 이미지 업로드 및 삭제

import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/api";

// 이미지 업로드 제한
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 그룹 이미지 업로드 Server Action
 * 기존 이미지가 있으면 자동으로 교체합니다
 *
 * @param groupId - 그룹 ID
 * @param formData - FormData 객체 (image 필드에 File)
 * @returns ActionResult<string> - 업로드된 이미지 URL 또는 에러
 */
export async function uploadGroupImage(
  groupId: string,
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 그룹 조회
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return { success: false, error: "그룹을 찾을 수 없습니다" };
    }

    // 3. 권한 검사 (owner 또는 admin만 가능)
    const userRole = await checkMemberRole(groupId, user.id);
    if (!userRole || (userRole !== "owner" && userRole !== "admin")) {
      return { success: false, error: "그룹 이미지 변경 권한이 없습니다" };
    }

    // 4. 파일 가져오기
    const file = formData.get("image") as File;

    if (!file || file.size === 0) {
      return { success: false, error: "업로드할 이미지를 선택해주세요" };
    }

    // 5. 파일 유효성 검사
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "지원하지 않는 이미지 형식입니다 (JPG, PNG, WebP, GIF만 가능)",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "이미지 크기는 5MB 이하여야 합니다" };
    }

    // 6. 기존 이미지가 있으면 삭제
    if (group.image_url) {
      try {
        const url = new URL(group.image_url);
        const pathParts = url.pathname.split("/");
        const bucketIndex = pathParts.indexOf("group-images");
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join("/");
          await supabase.storage.from("group-images").remove([filePath]);
        }
      } catch (error) {
        console.error("기존 이미지 삭제 오류 (무시):", error);
      }
    }

    // 7. 새 이미지 업로드
    const fileExt = file.name.split(".").pop();
    const fileName = `${groupId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("group-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage 업로드 오류:", uploadError);
      throw uploadError;
    }

    // 8. Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("group-images").getPublicUrl(fileName);

    // 9. groups 테이블 업데이트
    const { error: updateError } = await supabase
      .from("groups")
      .update({ image_url: publicUrl })
      .eq("id", groupId);

    if (updateError) {
      console.error("groups 업데이트 오류:", updateError);
      throw updateError;
    }

    // 10. 캐시 무효화
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/groups");

    return { success: true, data: publicUrl };
  } catch (error) {
    console.error("uploadGroupImage 오류:", error);
    return {
      success: false,
      error: "이미지 업로드 중 오류가 발생했습니다",
    };
  }
}

/**
 * 그룹 이미지 삭제 Server Action
 *
 * @param groupId - 그룹 ID
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function deleteGroupImage(
  groupId: string
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

    // 2. 그룹 조회
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return { success: false, error: "그룹을 찾을 수 없습니다" };
    }

    // 3. 권한 검사 (owner 또는 admin만 가능)
    const userRole = await checkMemberRole(groupId, user.id);
    if (!userRole || (userRole !== "owner" && userRole !== "admin")) {
      return { success: false, error: "그룹 이미지 삭제 권한이 없습니다" };
    }

    // 4. 이미지가 없으면 에러
    if (!group.image_url) {
      return { success: false, error: "삭제할 이미지가 없습니다" };
    }

    // 5. Storage에서 이미지 삭제
    try {
      const url = new URL(group.image_url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf("group-images");
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from("group-images").remove([filePath]);
      }
    } catch (error) {
      console.error("Storage 삭제 오류:", error);
    }

    // 6. groups 테이블 업데이트
    const { error: updateError } = await supabase
      .from("groups")
      .update({ image_url: null })
      .eq("id", groupId);

    if (updateError) {
      console.error("groups 업데이트 오류:", updateError);
      throw updateError;
    }

    // 7. 캐시 무효화
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/groups");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteGroupImage 오류:", error);
    return {
      success: false,
      error: "이미지 삭제 중 오류가 발생했습니다",
    };
  }
}
