// 애플리케이션에서 사용하는 열거형 타입 정의

/**
 * 모임 멤버 역할
 */
export type Role = "owner" | "admin" | "member";

/**
 * 이벤트 참석 상태
 */
export type AttendanceStatus = "attending" | "not_attending" | "maybe";

/**
 * 이벤트 상태
 */
export type EventStatus = "scheduled" | "ongoing" | "completed" | "cancelled";

/**
 * 알림 타입
 */
export type NotificationType = "new_event" | "reminder" | "announcement";
