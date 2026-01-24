"use server";

// 프로필 이미지 관련 Server Actions
// 사용자 아바타 이미지 업로드 및 삭제

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/api";

// 프로필 이미지 업로드 제한 (프로필은 더 작게)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 프로필 이미지 업로드 Server Action
 * 기존 아바타가 있으면 자동으로 교체합니다
 *
 * @param formData - FormData 객체 (image 필드에 File)
 * @returns ActionResult<string> - 업로드된 이미지 URL 또는 에러
 */
export async function uploadProfileImage(
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

    // 2. 현재 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("프로필 조회 오류:", profileError);
      return { success: false, error: "프로필을 찾을 수 없습니다" };
    }

    // 3. 파일 가져오기
    const file = formData.get("image") as File;

    if (!file || file.size === 0) {
      return { success: false, error: "업로드할 이미지를 선택해주세요" };
    }

    // 4. 파일 유효성 검사
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "지원하지 않는 이미지 형식입니다 (JPG, PNG, WebP, GIF만 가능)",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "프로필 이미지는 2MB 이하여야 합니다" };
    }

    // 5. 기존 커스텀 아바타가 있으면 삭제 (외부 OAuth 아바타는 제외)
    if (profile?.avatar_url?.includes("supabase.co/storage")) {
      try {
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split("/");
        const bucketIndex = pathParts.indexOf("avatars");
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join("/");
          await supabase.storage.from("avatars").remove([filePath]);
        }
      } catch (error) {
        console.error("기존 아바타 삭제 오류 (무시):", error);
      }
    }

    // 6. 새 이미지 업로드
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage 업로드 오류:", uploadError);
      throw uploadError;
    }

    // 7. Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // 8. profiles 테이블 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("profiles 업데이트 오류:", updateError);
      throw updateError;
    }

    // 9. 캐시 무효화
    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, data: publicUrl };
  } catch (error) {
    console.error("uploadProfileImage 오류:", error);
    return {
      success: false,
      error: "이미지 업로드 중 오류가 발생했습니다",
    };
  }
}

/**
 * 프로필 이미지 삭제 Server Action
 * 커스텀 업로드 이미지만 삭제 가능 (OAuth 프로필 이미지는 삭제 불가)
 *
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function deleteProfileImage(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 현재 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("프로필 조회 오류:", profileError);
      return { success: false, error: "프로필을 찾을 수 없습니다" };
    }

    // 3. 아바타가 없거나 외부 URL인 경우
    if (!profile?.avatar_url) {
      return { success: false, error: "삭제할 아바타가 없습니다" };
    }

    // Supabase Storage 이미지인지 확인
    if (!profile.avatar_url.includes("supabase.co/storage")) {
      return {
        success: false,
        error: "소셜 로그인 프로필 이미지는 삭제할 수 없습니다",
      };
    }

    // 4. Storage에서 이미지 삭제
    try {
      const url = new URL(profile.avatar_url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf("avatars");
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from("avatars").remove([filePath]);
      }
    } catch (error) {
      console.error("Storage 삭제 오류:", error);
    }

    // 5. profiles 테이블 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("profiles 업데이트 오류:", updateError);
      throw updateError;
    }

    // 6. 캐시 무효화
    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteProfileImage 오류:", error);
    return {
      success: false,
      error: "이미지 삭제 중 오류가 발생했습니다",
    };
  }
}
