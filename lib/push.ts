// 웹 푸시 알림 발송 유틸리티
// web-push 라이브러리를 사용하여 푸시 알림을 발송합니다.

import webpush from "web-push";
import { getVapidConfig } from "./env";
import type { NotificationType } from "@/types/enums";

// VAPID 설정 초기화 여부
let vapidConfigured = false;

/**
 * VAPID 설정을 초기화합니다.
 * 푸시 발송 전 반드시 호출해야 합니다.
 */
export function initializeVapid(): void {
  if (vapidConfigured) return;

  const { publicKey, privateKey, subject } = getVapidConfig();

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  console.log("[Push] VAPID 설정 완료");
}

/**
 * 푸시 알림 페이로드 타입
 */
export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * 푸시 구독 정보 타입 (DB에서 조회한 형태)
 */
export interface PushSubscriptionData {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * 푸시 발송 결과 타입
 */
export interface PushSendResult {
  success: boolean;
  subscriptionId: string;
  userId: string;
  error?: string;
  statusCode?: number;
}

/**
 * 단일 구독에 푸시 알림을 발송합니다.
 *
 * @param subscription - 푸시 구독 정보
 * @param payload - 알림 페이로드
 * @returns 발송 결과
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<PushSendResult> {
  // VAPID 초기화 확인
  initializeVapid();

  // web-push가 요구하는 형식으로 변환
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    const result = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return {
      success: true,
      subscriptionId: subscription.id,
      userId: subscription.user_id,
      statusCode: result.statusCode,
    };
  } catch (error) {
    const webPushError = error as webpush.WebPushError;

    return {
      success: false,
      subscriptionId: subscription.id,
      userId: subscription.user_id,
      error: webPushError.message || "알 수 없는 오류",
      statusCode: webPushError.statusCode,
    };
  }
}

/**
 * 여러 구독에 푸시 알림을 일괄 발송합니다.
 *
 * @param subscriptions - 푸시 구독 목록
 * @param payload - 알림 페이로드
 * @returns 발송 결과 목록
 */
export async function sendPushNotifications(
  subscriptions: PushSubscriptionData[],
  payload: PushPayload
): Promise<PushSendResult[]> {
  // 병렬로 발송
  const results = await Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  return results;
}

/**
 * 만료되거나 거부된 구독인지 확인합니다.
 * 410 Gone 또는 404 Not Found는 구독이 만료된 것을 의미합니다.
 *
 * @param statusCode - HTTP 상태 코드
 * @returns 만료된 구독 여부
 */
export function isExpiredSubscription(statusCode: number | undefined): boolean {
  return statusCode === 410 || statusCode === 404;
}

/**
 * 알림 유형에 따른 기본 아이콘 반환
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "new_event":
      return "/icons/event-icon.png";
    case "reminder":
      return "/icons/reminder-icon.png";
    case "announcement":
      return "/icons/announcement-icon.png";
    default:
      return "/icons/icon-192.png";
  }
}

/**
 * 알림 유형에 따른 기본 태그 반환
 * 같은 태그의 알림은 하나로 합쳐집니다.
 */
export function getNotificationTag(
  type: NotificationType,
  relatedId?: string
): string {
  if (relatedId) {
    return `${type}-${relatedId}`;
  }
  return type;
}
