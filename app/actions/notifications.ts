"use server";

// 알림 관련 Server Actions
// 푸시 알림 발송 및 알림 로그 관리

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/types/supabase";
import type { ActionResult } from "@/types/api";
import type { NotificationType } from "@/types/enums";

// 내부 API URL (서버 사이드에서 호출)
const getApiBaseUrl = () => {
  // Vercel 환경
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // 로컬 개발 환경
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
};

/**
 * 알림 설정에 따라 수신 가능한 사용자만 필터링
 * 설정이 없는 사용자는 기본값(true)으로 처리하여 포함합니다
 *
 * @param userIds - 필터링할 사용자 ID 목록
 * @param notificationType - 알림 타입 ('new_event' | 'reminder' | 'announcement')
 * @returns 해당 알림을 받을 수 있는 사용자 ID 목록
 */
async function filterEligibleRecipients(
  userIds: string[],
  notificationType: "new_event" | "reminder" | "announcement"
): Promise<string[]> {
  if (userIds.length === 0) return [];

  try {
    const supabase = await createClient();

    // 알림 타입에 따른 설정 필드 매핑
    const settingFieldMap = {
      new_event: "new_event_enabled",
      reminder: "reminder_enabled",
      announcement: "announcement_enabled",
    } as const;

    const settingField = settingFieldMap[notificationType];

    // 사용자별 알림 설정 조회
    const { data: settings, error } = await supabase
      .from("user_notification_settings")
      .select("user_id, " + settingField)
      .in("user_id", userIds);

    if (error) {
      console.error("[filterEligibleRecipients] 설정 조회 실패:", error);
      // 오류 발생 시 모든 사용자에게 발송 (안전한 기본 동작)
      return userIds;
    }

    // 설정이 있는 사용자 ID와 해당 설정값을 맵으로 변환
    const settingsMap = new Map<string, boolean>();
    if (settings) {
      for (const setting of settings) {
        // 동적 필드 접근을 위해 타입 단언 (Supabase 반환 타입 처리)
        const settingRecord = setting as unknown as Record<string, unknown>;
        const userId = settingRecord.user_id as string;
        const enabled = settingRecord[settingField] as boolean;
        settingsMap.set(userId, enabled);
      }
    }

    // 설정이 활성화되어 있거나 설정이 없는(기본값 true) 사용자만 필터링
    const eligibleUserIds = userIds.filter((userId) => {
      const setting = settingsMap.get(userId);
      // 설정이 없으면 기본값 true, 있으면 해당 값 사용
      return setting === undefined ? true : setting;
    });

    console.log(`[filterEligibleRecipients] ${notificationType} 알림:`, {
      total: userIds.length,
      eligible: eligibleUserIds.length,
      filtered: userIds.length - eligibleUserIds.length,
    });

    return eligibleUserIds;
  } catch (error) {
    console.error("[filterEligibleRecipients] 오류:", error);
    // 오류 발생 시 모든 사용자에게 발송
    return userIds;
  }
}

/**
 * 새 이벤트 생성 알림 발송
 * 그룹의 모든 멤버에게 알림을 보냅니다 (생성자 제외)
 *
 * @param eventId - 생성된 이벤트 ID
 * @param groupId - 그룹 ID
 * @param creatorId - 이벤트 생성자 ID (알림 제외)
 */
export async function sendEventCreatedNotification(
  eventId: string,
  groupId: string,
  creatorId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // 1. 이벤트 정보 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title, event_date")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("[Notification] 이벤트 조회 실패:", eventError);
      return;
    }

    // 2. 그룹 멤버 목록 조회 (생성자 제외)
    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .neq("user_id", creatorId);

    if (membersError || !members || members.length === 0) {
      console.log("[Notification] 알림 대상 멤버 없음");
      return;
    }

    // 3. 알림 설정에 따라 수신 대상 필터링
    const allUserIds = members.map((m) => m.user_id);
    const userIds = await filterEligibleRecipients(allUserIds, "new_event");

    if (userIds.length === 0) {
      console.log("[Notification] 새 이벤트 알림 수신 가능한 멤버 없음 (모두 비활성화)");
      return;
    }

    // 4. 푸시 알림 발송
    const eventDate = new Date(event.event_date).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    await fetch(`${getApiBaseUrl()}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds,
        notification: {
          type: "new_event" as NotificationType,
          title: "새 이벤트가 등록되었습니다",
          message: `${event.title} - ${eventDate}`,
          relatedEventId: eventId,
          url: `/groups/${groupId}/events/${eventId}`,
        },
      }),
    });

    console.log("[Notification] 새 이벤트 알림 발송 완료:", {
      eventId,
      recipients: userIds.length,
    });
  } catch (error) {
    // 알림 발송 실패는 로그만 남기고 무시 (메인 작업에 영향 없음)
    console.error("[Notification] 새 이벤트 알림 발송 실패:", error);
  }
}

/**
 * 공지사항 알림 발송
 * 그룹 또는 이벤트 관련 멤버에게 알림을 보냅니다 (작성자 제외)
 *
 * @param announcementId - 공지사항 ID
 */
export async function sendAnnouncementNotification(
  announcementId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // 1. 공지사항 정보 조회
    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .select("title, content, group_id, event_id, author_id")
      .eq("id", announcementId)
      .single();

    if (announcementError || !announcement) {
      console.error("[Notification] 공지사항 조회 실패:", announcementError);
      return;
    }

    let userIds: string[] = [];
    let url = "/notifications";

    // 2. 알림 대상 결정
    if (announcement.group_id) {
      // 그룹 공지: 그룹 멤버 전체
      const { data: members } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", announcement.group_id)
        .neq("user_id", announcement.author_id);

      userIds = members?.map((m) => m.user_id) || [];
      url = `/groups/${announcement.group_id}`;
    } else if (announcement.event_id) {
      // 이벤트 공지: 이벤트 참가자 (참석 응답한 사람)
      const { data: participants } = await supabase
        .from("participants")
        .select("user_id")
        .eq("event_id", announcement.event_id)
        .neq("user_id", announcement.author_id);

      userIds = participants?.map((p) => p.user_id) || [];

      // 이벤트의 그룹 ID 조회
      const { data: event } = await supabase
        .from("events")
        .select("group_id")
        .eq("id", announcement.event_id)
        .single();

      if (event) {
        url = `/groups/${event.group_id}/events/${announcement.event_id}`;
      }
    }

    if (userIds.length === 0) {
      console.log("[Notification] 공지 알림 대상 없음");
      return;
    }

    // 3. 알림 설정에 따라 수신 대상 필터링
    const eligibleUserIds = await filterEligibleRecipients(userIds, "announcement");

    if (eligibleUserIds.length === 0) {
      console.log("[Notification] 공지 알림 수신 가능한 멤버 없음 (모두 비활성화)");
      return;
    }

    // 4. 푸시 알림 발송
    await fetch(`${getApiBaseUrl()}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds: eligibleUserIds,
        notification: {
          type: "announcement" as NotificationType,
          title: "새 공지사항",
          message: announcement.title,
          relatedEventId: announcement.event_id || undefined,
          url,
        },
      }),
    });

    console.log("[Notification] 공지사항 알림 발송 완료:", {
      announcementId,
      recipients: eligibleUserIds.length,
    });
  } catch (error) {
    console.error("[Notification] 공지사항 알림 발송 실패:", error);
  }
}

/**
 * 리마인더 알림 발송
 * 이벤트 참석 예정자에게 알림을 보냅니다
 *
 * @param eventId - 이벤트 ID
 */
export async function sendReminderNotification(eventId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // 1. 이벤트 정보 조회
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title, event_date, group_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("[Notification] 이벤트 조회 실패:", eventError);
      return;
    }

    // 2. 참석 예정자 조회 (status = 'attending')
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("user_id")
      .eq("event_id", eventId)
      .eq("status", "attending");

    if (participantsError || !participants || participants.length === 0) {
      console.log("[Notification] 리마인더 대상 없음");
      return;
    }

    // 3. 알림 설정에 따라 수신 대상 필터링
    const allUserIds = participants.map((p) => p.user_id);
    const userIds = await filterEligibleRecipients(allUserIds, "reminder");

    if (userIds.length === 0) {
      console.log("[Notification] 리마인더 알림 수신 가능한 멤버 없음 (모두 비활성화)");
      return;
    }

    // 4. 푸시 알림 발송
    const eventDate = new Date(event.event_date).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });

    await fetch(`${getApiBaseUrl()}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds,
        notification: {
          type: "reminder" as NotificationType,
          title: "이벤트 리마인더",
          message: `내일 예정: ${event.title} (${eventDate})`,
          relatedEventId: eventId,
          url: `/groups/${event.group_id}/events/${eventId}`,
        },
      }),
    });

    console.log("[Notification] 리마인더 알림 발송 완료:", {
      eventId,
      recipients: userIds.length,
    });
  } catch (error) {
    console.error("[Notification] 리마인더 알림 발송 실패:", error);
  }
}

/**
 * 사용자의 알림 목록 조회
 * @param limit - 최대 개수 (기본값: 20)
 * @returns 알림 목록
 */
export async function getNotificationsForUser(
  limit: number = 20
): Promise<Tables<"notification_logs">[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Notification] 알림 조회 실패:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Notification] 알림 조회 오류:", error);
    return [];
  }
}

/**
 * 알림 읽음 처리
 * @param notificationId - 알림 ID
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const { error } = await supabase
      .from("notification_logs")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id); // 본인 알림만 수정 가능

    if (error) {
      console.error("[Notification] 읽음 처리 실패:", error);
      return { success: false, error: "알림 읽음 처리에 실패했습니다" };
    }

    revalidatePath("/notifications");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Notification] 읽음 처리 오류:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const { error } = await supabase
      .from("notification_logs")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null); // 읽지 않은 것만

    if (error) {
      console.error("[Notification] 전체 읽음 처리 실패:", error);
      return { success: false, error: "알림 읽음 처리에 실패했습니다" };
    }

    revalidatePath("/notifications");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[Notification] 전체 읽음 처리 오류:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}

/**
 * 읽지 않은 알림 개수 조회
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from("notification_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("[Notification] 읽지 않은 알림 개수 조회 실패:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[Notification] 읽지 않은 알림 개수 조회 오류:", error);
    return 0;
  }
}

// ============================================================================
// 알림 설정 관리 (Notification Settings)
// ============================================================================

/**
 * 알림 설정 타입 정의
 * 사용자가 받을 알림 유형을 설정합니다
 */
export interface NotificationSettings {
  /** 새 이벤트 알림 활성화 여부 */
  newEventEnabled: boolean;
  /** 리마인더 알림 활성화 여부 */
  reminderEnabled: boolean;
  /** 공지사항 알림 활성화 여부 */
  announcementEnabled: boolean;
}

/**
 * 알림 설정 기본값
 * 설정이 없는 경우 모든 알림을 활성화합니다
 */
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  newEventEnabled: true,
  reminderEnabled: true,
  announcementEnabled: true,
};

/**
 * 사용자의 알림 설정 조회
 * 설정이 없는 경우 기본값을 반환합니다
 *
 * @returns 알림 설정 객체
 *
 * @example
 * ```tsx
 * const settings = await getNotificationSettings();
 * console.log(settings.newEventEnabled); // true 또는 false
 * ```
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const supabase = await createClient();

    // 1. 현재 로그인한 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // 로그인하지 않은 경우 기본값 반환
      return DEFAULT_NOTIFICATION_SETTINGS;
    }

    // 2. DB에서 알림 설정 조회
    const { data, error } = await supabase
      .from("user_notification_settings")
      .select("new_event_enabled, reminder_enabled, announcement_enabled")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // 설정이 없는 경우 (PGRST116: 결과 없음) 기본값 반환
      if (error.code === "PGRST116") {
        console.log("[NotificationSettings] 설정 없음, 기본값 사용");
        return DEFAULT_NOTIFICATION_SETTINGS;
      }
      console.error("[NotificationSettings] 설정 조회 실패:", error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }

    // 3. DB 필드명을 camelCase로 변환하여 반환
    return {
      newEventEnabled: data.new_event_enabled,
      reminderEnabled: data.reminder_enabled,
      announcementEnabled: data.announcement_enabled,
    };
  } catch (error) {
    console.error("[NotificationSettings] 설정 조회 오류:", error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * 사용자의 알림 설정 업데이트 (upsert)
 * 설정이 없으면 생성하고, 있으면 업데이트합니다
 *
 * @param settings - 업데이트할 알림 설정
 * @returns 성공 여부
 *
 * @example
 * ```tsx
 * const result = await updateNotificationSettings({
 *   newEventEnabled: true,
 *   reminderEnabled: false,
 *   announcementEnabled: true,
 * });
 *
 * if (result.success) {
 *   toast.success("설정이 저장되었습니다");
 * }
 * ```
 */
export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // 1. 현재 로그인한 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 2. 설정 upsert (INSERT ON CONFLICT UPDATE)
    const { error } = await supabase.from("user_notification_settings").upsert(
      {
        user_id: user.id,
        new_event_enabled: settings.newEventEnabled,
        reminder_enabled: settings.reminderEnabled,
        announcement_enabled: settings.announcementEnabled,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id", // user_id가 이미 존재하면 업데이트
      }
    );

    if (error) {
      console.error("[NotificationSettings] 설정 저장 실패:", error);
      return { success: false, error: "알림 설정 저장에 실패했습니다" };
    }

    // 3. 설정 페이지 캐시 갱신
    revalidatePath("/settings");

    console.log("[NotificationSettings] 설정 저장 완료:", {
      userId: user.id,
      settings,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[NotificationSettings] 설정 저장 오류:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
