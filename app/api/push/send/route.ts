// 푸시 알림 발송 API Route
// POST: 지정된 사용자들에게 푸시 알림 발송

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  sendPushNotifications,
  isExpiredSubscription,
  getNotificationIcon,
  getNotificationTag,
  type PushSubscriptionData,
  type PushPayload,
} from "@/lib/push";
import type { NotificationType } from "@/types/enums";

// Node.js 런타임 사용 (web-push는 Edge Runtime에서 동작하지 않음)
export const runtime = "nodejs";

// 요청 바디 스키마
const sendNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, "최소 1명의 사용자가 필요합니다"),
  notification: z.object({
    type: z.enum(["new_event", "reminder", "announcement"]),
    title: z.string().min(1, "제목이 필요합니다").max(100),
    message: z.string().min(1, "메시지가 필요합니다").max(500),
    relatedEventId: z.string().uuid().optional(),
    url: z.string().optional(),
  }),
});

/**
 * POST /api/push/send
 * 지정된 사용자들에게 푸시 알림을 발송합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Supabase 클라이언트 생성
    const supabase = await createClient();

    // 2. 인증 확인 (선택사항 - 서버 간 통신에서는 API 키 사용 가능)
    const { data: { user } } = await supabase.auth.getUser();

    // 3. 요청 바디 파싱 및 검증
    const body = await request.json();
    const validationResult = sendNotificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "잘못된 요청 형식입니다.",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { userIds, notification } = validationResult.data;
    const notificationType = notification.type as NotificationType;

    // 4. 대상 사용자들의 푸시 구독 조회
    const { data: subscriptions, error: fetchError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .in("user_id", userIds);

    if (fetchError) {
      console.error("[API] 구독 조회 오류:", fetchError);
      return NextResponse.json(
        { error: "구독 정보를 조회하는데 실패했습니다." },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "발송 대상이 없습니다.",
        sent: 0,
        failed: 0,
        noSubscription: userIds.length,
      });
    }

    // 5. 푸시 페이로드 생성
    const payload: PushPayload = {
      title: notification.title,
      body: notification.message,
      icon: getNotificationIcon(notificationType),
      url: notification.url || "/notifications",
      tag: getNotificationTag(notificationType, notification.relatedEventId),
      data: {
        type: notificationType,
        relatedEventId: notification.relatedEventId,
      },
    };

    // 6. 푸시 알림 발송
    const results = await sendPushNotifications(
      subscriptions as PushSubscriptionData[],
      payload
    );

    // 7. 만료된 구독 정리
    const expiredSubscriptionIds = results
      .filter((r) => !r.success && isExpiredSubscription(r.statusCode))
      .map((r) => r.subscriptionId);

    if (expiredSubscriptionIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", expiredSubscriptionIds);

      if (deleteError) {
        console.error("[API] 만료된 구독 삭제 실패:", deleteError);
      } else {
        console.log("[API] 만료된 구독 삭제:", expiredSubscriptionIds.length);
      }
    }

    // 8. 발송 로그 저장 (성공한 알림만)
    const successfulUserIds = [...new Set(
      results.filter((r) => r.success).map((r) => r.userId)
    )];

    if (successfulUserIds.length > 0) {
      const notificationLogs = successfulUserIds.map((userId) => ({
        user_id: userId,
        type: notificationType,
        title: notification.title,
        message: notification.message,
        related_event_id: notification.relatedEventId || null,
      }));

      const { error: logError } = await supabase
        .from("notification_logs")
        .insert(notificationLogs);

      if (logError) {
        console.error("[API] 알림 로그 저장 실패:", logError);
        // 로그 저장 실패는 발송 성공에 영향 없음
      }
    }

    // 9. 결과 집계
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log("[API] 푸시 발송 완료:", {
      총구독: subscriptions.length,
      성공: sent,
      실패: failed,
      만료삭제: expiredSubscriptionIds.length,
      발송자: user?.id || "system",
    });

    return NextResponse.json({
      success: true,
      message: `${sent}개의 알림이 발송되었습니다.`,
      sent,
      failed,
      expired: expiredSubscriptionIds.length,
      totalSubscriptions: subscriptions.length,
      targetUsers: userIds.length,
    });
  } catch (error) {
    console.error("[API] 푸시 발송 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
