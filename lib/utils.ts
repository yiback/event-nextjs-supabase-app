import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 초대 코드 생성 함수 (대소문자 구분 없는 읽기 쉬운 문자 사용)
// 혼동하기 쉬운 문자 제외: I, L, O, 0, 1
export function generateInviteCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Base64 URL 인코딩된 문자열을 Uint8Array로 변환합니다.
 * VAPID 공개키를 PushManager.subscribe()에 전달할 때 사용합니다.
 *
 * @param base64String - Base64 URL 인코딩된 문자열 (VAPID 공개키)
 * @returns Uint8Array 형태의 바이너리 데이터
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Base64 URL을 일반 Base64로 변환 (패딩 추가)
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  // Base64를 바이너리 문자열로 디코딩
  const rawData = atob(base64);

  // 바이너리 문자열을 Uint8Array로 변환
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
