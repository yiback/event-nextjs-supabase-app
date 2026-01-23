"use server";

// 이벤트 이미지 관련 Server Actions
// 이미지 업로드, 삭제, 조회 기능

import { createClient } from "@/lib/supabase/server";
import { checkMemberRole } from "@/lib/utils/permissions-server";
import { canManageEvent } from "@/lib/utils/permissions";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/types/supabase";
import type { ActionResult } from "@/types/api";

// 이미지 업로드 제한
const MAX_IMAGES_PER_EVENT = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 이벤트 이미지 업로드 Server Action
 * @param eventId - 이벤트 ID
 * @param formData - FormData 객체 (images 필드에 File 배열)
 * @returns ActionResult<Tables<'event_images'>[]> - 업로드된 이미지 정보 또는 에러
 *
 * 처리 흐름:
 * 1. 사용자 인증 확인
 * 2. 이벤트 조회 및 권한 검사
 * 3. 현재 이미지 개수 확인 (최대 5개)
 * 4. 파일 유효성 검사
 * 5. Supabase Storage에 업로드
 * 6. event_images 테이블에 INSERT
 * 7. 캐시 무효화
 */
export async function uploadEventImages(
  eventId: string,
  formData: FormData
): Promise<ActionResult<Tables<"event_images">[]>> {
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
        error: "이벤트 이미지 업로드 권한이 없습니다",
      };
    }

    // 4. 현재 이미지 개수 확인
    const { data: existingImages, error: countError } = await supabase
      .from("event_images")
      .select("id")
      .eq("event_id", eventId);

    if (countError) {
      console.error("이미지 개수 조회 오류:", countError);
      throw countError;
    }

    const currentCount = existingImages?.length || 0;

    // 5. 파일 목록 가져오기
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return { success: false, error: "업로드할 이미지를 선택해주세요" };
    }

    // 최대 이미지 개수 확인
    if (currentCount + files.length > MAX_IMAGES_PER_EVENT) {
      return {
        success: false,
        error: `이미지는 최대 ${MAX_IMAGES_PER_EVENT}개까지 업로드할 수 있습니다 (현재: ${currentCount}개)`,
      };
    }

    // 6. 파일 유효성 검사
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          success: false,
          error: "지원하지 않는 이미지 형식입니다 (JPG, PNG, WebP, GIF만 가능)",
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: "이미지 크기는 5MB 이하여야 합니다",
        };
      }
    }

    // 7. Storage 업로드 및 DB 저장
    const uploadedImages: Tables<"event_images">[] = [];
    let displayOrder = currentCount;

    for (const file of files) {
      // 파일명 생성 (UUID + 확장자)
      const fileExt = file.name.split(".").pop();
      const fileName = `${eventId}/${crypto.randomUUID()}.${fileExt}`;

      // Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage 업로드 오류:", uploadError);
        // 업로드 실패 시 이미 업로드된 이미지들도 롤백 (선택적)
        throw uploadError;
      }

      // Public URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(fileName);

      // event_images 테이블에 INSERT
      const { data: imageRecord, error: insertError } = await supabase
        .from("event_images")
        .insert({
          event_id: eventId,
          image_url: publicUrl,
          display_order: displayOrder++,
        })
        .select()
        .single();

      if (insertError) {
        console.error("event_images INSERT 오류:", insertError);
        throw insertError;
      }

      uploadedImages.push(imageRecord);
    }

    // 8. 캐시 무효화
    revalidatePath(`/groups/${event.group_id}/events/${eventId}`);

    return { success: true, data: uploadedImages };
  } catch (error) {
    console.error("uploadEventImages 오류:", error);
    return {
      success: false,
      error: "이미지 업로드 중 오류가 발생했습니다",
    };
  }
}

/**
 * 이벤트 이미지 삭제 Server Action
 * @param imageId - 이미지 ID
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function deleteEventImage(
  imageId: string
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

    // 2. 이미지 정보 조회
    const { data: image, error: imageError } = await supabase
      .from("event_images")
      .select(
        `
        *,
        events (
          id,
          group_id,
          created_by
        )
      `
      )
      .eq("id", imageId)
      .single();

    if (imageError || !image) {
      return { success: false, error: "이미지를 찾을 수 없습니다" };
    }

    // events 정보 타입 변환
    const eventInfo = image.events as unknown as {
      id: string;
      group_id: string;
      created_by: string;
    };

    if (!eventInfo) {
      return { success: false, error: "이벤트 정보를 찾을 수 없습니다" };
    }

    // 3. 권한 검사
    const userRole = await checkMemberRole(eventInfo.group_id, user.id);
    if (!userRole) {
      return { success: false, error: "해당 모임의 멤버가 아닙니다" };
    }

    if (!canManageEvent(userRole, eventInfo.created_by, user.id)) {
      return {
        success: false,
        error: "이미지 삭제 권한이 없습니다",
      };
    }

    // 4. Storage에서 이미지 삭제
    // URL에서 파일 경로 추출
    const url = new URL(image.image_url);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf("event-images");
    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join("/");

      const { error: storageError } = await supabase.storage
        .from("event-images")
        .remove([filePath]);

      if (storageError) {
        console.error("Storage 삭제 오류:", storageError);
        // Storage 삭제 실패해도 DB 레코드는 삭제 진행
      }
    }

    // 5. event_images 테이블에서 DELETE
    const { error: deleteError } = await supabase
      .from("event_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      console.error("event_images DELETE 오류:", deleteError);
      throw deleteError;
    }

    // 6. 캐시 무효화
    revalidatePath(`/groups/${eventInfo.group_id}/events/${eventInfo.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteEventImage 오류:", error);
    return {
      success: false,
      error: "이미지 삭제 중 오류가 발생했습니다",
    };
  }
}

/**
 * 이벤트 이미지 목록 조회
 * @param eventId - 이벤트 ID
 * @returns Tables<'event_images'>[] - 이미지 목록 (display_order 순)
 */
export async function getEventImages(
  eventId: string
): Promise<Tables<"event_images">[]> {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("getEventImages: 로그인되지 않은 사용자");
      return [];
    }

    // 이벤트 정보 조회 (권한 확인용)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("group_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.log("getEventImages: 이벤트를 찾을 수 없음");
      return [];
    }

    // 사용자가 해당 모임의 멤버인지 확인
    const userRole = await checkMemberRole(event.group_id, user.id);
    if (!userRole) {
      console.log("getEventImages: 사용자가 해당 모임의 멤버가 아님");
      return [];
    }

    // 이미지 목록 조회
    const { data, error } = await supabase
      .from("event_images")
      .select("*")
      .eq("event_id", eventId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("getEventImages 오류:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("getEventImages 오류:", error);
    return [];
  }
}

/**
 * 이미지 순서 변경 Server Action
 * @param eventId - 이벤트 ID
 * @param imageIds - 새로운 순서의 이미지 ID 배열
 * @returns ActionResult<void> - 성공 여부 또는 에러
 */
export async function reorderEventImages(
  eventId: string,
  imageIds: string[]
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
        error: "이미지 순서 변경 권한이 없습니다",
      };
    }

    // 4. 각 이미지의 display_order 업데이트
    for (let i = 0; i < imageIds.length; i++) {
      const { error: updateError } = await supabase
        .from("event_images")
        .update({ display_order: i })
        .eq("id", imageIds[i])
        .eq("event_id", eventId);

      if (updateError) {
        console.error("reorderEventImages UPDATE 오류:", updateError);
        throw updateError;
      }
    }

    // 5. 캐시 무효화
    revalidatePath(`/groups/${event.group_id}/events/${eventId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("reorderEventImages 오류:", error);
    return {
      success: false,
      error: "이미지 순서 변경 중 오류가 발생했습니다",
    };
  }
}
