// Supabase 데이터베이스 테이블 타입 정의
// PRD 데이터 모델 기반

import type {
  Role,
  AttendanceStatus,
  EventStatus,
  NotificationType,
} from "./enums";

/**
 * 사용자 프로필 (profiles 테이블)
 */
export interface Profile {
  id: string; // UUID (Supabase Auth 연동)
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string; // ISO 타임스탬프
}

/**
 * 모임 그룹 (groups 테이블)
 */
export interface Group {
  id: string; // UUID
  name: string;
  description: string | null;
  image_url: string | null;
  invite_code: string; // 8자 랜덤 (unique)
  invite_code_expires_at: string | null; // ISO 타임스탬프
  owner_id: string; // profiles.id 참조
  created_at: string;
}

/**
 * 그룹 멤버 (group_members 테이블)
 */
export interface GroupMember {
  id: string; // UUID
  group_id: string; // groups.id 참조
  user_id: string; // profiles.id 참조
  role: Role;
  joined_at: string;
}

/**
 * 이벤트 (events 테이블)
 */
export interface Event {
  id: string; // UUID
  group_id: string; // groups.id 참조
  title: string;
  description: string | null;
  event_date: string; // ISO 타임스탬프
  location: string | null;
  response_deadline: string | null;
  status: EventStatus;
  max_participants: number | null;
  cost: number; // 기본값: 0
  created_by: string; // profiles.id 참조
  created_at: string;
}

/**
 * 이벤트 참여자 (participants 테이블)
 * 제약조건: UNIQUE(event_id, user_id)
 */
export interface Participant {
  id: string; // UUID
  event_id: string; // events.id 참조
  user_id: string; // profiles.id 참조
  status: AttendanceStatus;
  responded_at: string;
}

/**
 * 공지사항 (announcements 테이블)
 */
export interface Announcement {
  id: string; // UUID
  group_id: string | null; // groups.id 참조
  event_id: string | null; // events.id 참조
  title: string;
  content: string;
  author_id: string; // profiles.id 참조
  created_at: string;
}

/**
 * 푸시 알림 구독 (push_subscriptions 테이블)
 */
export interface PushSubscription {
  id: string; // UUID
  user_id: string; // profiles.id 참조
  endpoint: string; // unique
  p256dh: string; // 암호화 키
  auth: string; // 인증 시크릿
  created_at: string;
}

/**
 * 알림 발송 로그 (notification_logs 테이블)
 */
export interface NotificationLog {
  id: string; // UUID
  user_id: string; // profiles.id 참조
  type: NotificationType;
  title: string;
  message: string;
  related_event_id: string | null; // events.id 참조
  sent_at: string;
  read_at: string | null;
}

/**
 * 이벤트 이미지 (event_images 테이블)
 */
export interface EventImage {
  id: string; // UUID
  event_id: string; // events.id 참조
  image_url: string;
  display_order: number; // 기본값: 0
  created_at: string;
}

/**
 * 사용자 이벤트 설정 (user_event_settings 테이블)
 * 제약조건: UNIQUE(user_id, event_id)
 */
export interface UserEventSettings {
  id: string; // UUID
  user_id: string; // profiles.id 참조
  event_id: string; // events.id 참조
  is_favorite: boolean; // 기본값: false
  notification_enabled: boolean; // 기본값: true
  created_at: string;
}

// ============================================
// 관계형 타입 (JOIN 결과용)
// ============================================

/**
 * 그룹 멤버 + 프로필 정보
 */
export interface GroupMemberWithProfile extends GroupMember {
  profile: Profile;
}

/**
 * 그룹 + 소유자 정보
 */
export interface GroupWithOwner extends Group {
  owner: Profile;
}

/**
 * 이벤트 + 그룹 정보
 */
export interface EventWithGroup extends Event {
  group: Group;
}

/**
 * 이벤트 + 참여자 수
 */
export interface EventWithParticipantCount extends Event {
  participant_count: number;
  attending_count: number;
}

/**
 * 참여자 + 프로필 정보
 */
export interface ParticipantWithProfile extends Participant {
  profile: Profile;
}

/**
 * 공지사항 + 작성자 정보
 */
export interface AnnouncementWithAuthor extends Announcement {
  author: Profile;
}
