// Mock 데이터 정적 배열 및 헬퍼 함수
// 현실적인 관계형 데이터 구조

import type {
  Profile,
  Group,
  GroupMember,
  Event,
  Participant,
  Announcement,
  NotificationLog,
  GroupMemberWithProfile,
  EventWithGroup,
  ParticipantWithProfile,
  AnnouncementWithAuthor,
} from "@/types/database";
import {
  generateProfile,
  generateGroup,
  generateGroupMember,
  generateEvent,
  generateParticipant,
  generateAnnouncement,
  generateNotification,
} from "./generators";

// ============================================
// 현재 사용자 ID (고정)
// ============================================

export const currentUserId = "00000000-0000-0000-0000-000000000001";

// ============================================
// 정적 데이터 배열
// ============================================

/**
 * 사용자 프로필 8명 (현재 사용자 포함)
 */
export const mockProfiles: Profile[] = [
  generateProfile({
    id: currentUserId,
    email: "current.user@example.com",
    full_name: "김현우",
  }),
  generateProfile({
    id: "00000000-0000-0000-0000-000000000002",
    email: "park.minjee@example.com",
    full_name: "박민지",
  }),
  generateProfile({
    id: "00000000-0000-0000-0000-000000000003",
    email: "lee.jihoon@example.com",
    full_name: "이지훈",
  }),
  generateProfile({
    id: "00000000-0000-0000-0000-000000000004",
    email: "choi.soyeon@example.com",
    full_name: "최소연",
  }),
  generateProfile({
    id: "00000000-0000-0000-0000-000000000005",
    email: "jung.taehyun@example.com",
    full_name: "정태현",
  }),
  generateProfile({
    id: "00000000-0000-0000-0000-000000000006",
    email: "kang.yuri@example.com",
    full_name: "강유리",
  }),
  generateProfile({
    id: "00000000-0000-0000-0000-000000000007",
    email: "han.seojin@example.com",
    full_name: "한서진",
  }),
  generateProfile({
    id: "00000000-0000-0000-0000-000000000008",
    email: "yoon.jiwoo@example.com",
    full_name: "윤지우",
  }),
];

/**
 * 모임 그룹 4개
 */
export const mockGroups: Group[] = [
  generateGroup(currentUserId, {
    id: "group-000-swimming",
    name: "주말 수영 모임",
    description: "주말마다 함께 수영하는 건강한 모임입니다.",
    invite_code: "SWIM2024",
  }),
  generateGroup(mockProfiles[1].id, {
    id: "group-000-fitness",
    name: "헬스 PT 그룹",
    description: "함께 운동하며 건강을 지키는 헬스 모임입니다.",
    invite_code: "FIT2024A",
  }),
  generateGroup(mockProfiles[2].id, {
    id: "group-000-reading",
    name: "북클럽 독서 모임",
    description: "매주 책을 읽고 토론하는 독서 모임입니다.",
    invite_code: "BOOK2024",
  }),
  generateGroup(mockProfiles[3].id, {
    id: "group-000-hiking",
    name: "등산 동호회",
    description: "주말 등산을 함께하는 활동적인 모임입니다.",
    invite_code: "HIKE2024",
  }),
];

/**
 * 그룹 멤버 20건
 * - owner: 4명 (각 그룹당 1명)
 * - admin: 4명
 * - member: 12명
 */
export const mockGroupMembers: GroupMember[] = [
  // 수영 모임 (5명)
  generateGroupMember(mockGroups[0].id, currentUserId, "owner"),
  generateGroupMember(mockGroups[0].id, mockProfiles[1].id, "admin"),
  generateGroupMember(mockGroups[0].id, mockProfiles[4].id, "member"),
  generateGroupMember(mockGroups[0].id, mockProfiles[5].id, "member"),
  generateGroupMember(mockGroups[0].id, mockProfiles[6].id, "member"),

  // 헬스 모임 (5명)
  generateGroupMember(mockGroups[1].id, mockProfiles[1].id, "owner"),
  generateGroupMember(mockGroups[1].id, currentUserId, "admin"),
  generateGroupMember(mockGroups[1].id, mockProfiles[2].id, "member"),
  generateGroupMember(mockGroups[1].id, mockProfiles[3].id, "member"),
  generateGroupMember(mockGroups[1].id, mockProfiles[7].id, "member"),

  // 독서 모임 (5명)
  generateGroupMember(mockGroups[2].id, mockProfiles[2].id, "owner"),
  generateGroupMember(mockGroups[2].id, mockProfiles[3].id, "admin"),
  generateGroupMember(mockGroups[2].id, currentUserId, "member"),
  generateGroupMember(mockGroups[2].id, mockProfiles[4].id, "member"),
  generateGroupMember(mockGroups[2].id, mockProfiles[5].id, "member"),

  // 등산 모임 (5명)
  generateGroupMember(mockGroups[3].id, mockProfiles[3].id, "owner"),
  generateGroupMember(mockGroups[3].id, mockProfiles[4].id, "admin"),
  generateGroupMember(mockGroups[3].id, currentUserId, "member"),
  generateGroupMember(mockGroups[3].id, mockProfiles[6].id, "member"),
  generateGroupMember(mockGroups[3].id, mockProfiles[7].id, "member"),
];

/**
 * 이벤트 12개
 * - 과거: 3개 (completed)
 * - 진행중: 6개 (scheduled)
 * - 미래: 3개 (scheduled)
 */
const now = new Date();
const pastDate1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7일 전
const pastDate2 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3일 전
const pastDate3 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1일 전
const futureDate1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2일 후
const futureDate2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5일 후
const futureDate3 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7일 후

export const mockEvents: Event[] = [
  // 수영 모임 이벤트 (3개)
  generateEvent(mockGroups[0].id, currentUserId, {
    id: "event-001",
    title: "주말 수영장 모임",
    event_date: pastDate1.toISOString(),
    status: "completed",
  }),
  generateEvent(mockGroups[0].id, currentUserId, {
    id: "event-002",
    title: "수영 PT 세션",
    event_date: futureDate1.toISOString(),
    status: "scheduled",
  }),
  generateEvent(mockGroups[0].id, mockProfiles[1].id, {
    id: "event-003",
    title: "수영 대회 준비",
    event_date: futureDate2.toISOString(),
    status: "scheduled",
  }),

  // 헬스 모임 이벤트 (3개)
  generateEvent(mockGroups[1].id, mockProfiles[1].id, {
    id: "event-004",
    title: "헬스장 PT 세션",
    event_date: pastDate2.toISOString(),
    status: "completed",
  }),
  generateEvent(mockGroups[1].id, currentUserId, {
    id: "event-005",
    title: "주말 헬스 모임",
    event_date: futureDate1.toISOString(),
    status: "scheduled",
  }),
  generateEvent(mockGroups[1].id, mockProfiles[2].id, {
    id: "event-006",
    title: "체력 테스트",
    event_date: futureDate3.toISOString(),
    status: "scheduled",
  }),

  // 독서 모임 이벤트 (3개)
  generateEvent(mockGroups[2].id, mockProfiles[2].id, {
    id: "event-007",
    title: "독서 토론회 - 1984",
    event_date: pastDate3.toISOString(),
    status: "completed",
  }),
  generateEvent(mockGroups[2].id, mockProfiles[3].id, {
    id: "event-008",
    title: "독서 토론회 - 데미안",
    event_date: futureDate1.toISOString(),
    status: "scheduled",
  }),
  generateEvent(mockGroups[2].id, currentUserId, {
    id: "event-009",
    title: "독서 토론회 - 카라마조프 가의 형제들",
    event_date: futureDate2.toISOString(),
    status: "scheduled",
  }),

  // 등산 모임 이벤트 (3개)
  generateEvent(mockGroups[3].id, mockProfiles[3].id, {
    id: "event-010",
    title: "북한산 등산",
    event_date: futureDate1.toISOString(),
    status: "scheduled",
  }),
  generateEvent(mockGroups[3].id, mockProfiles[4].id, {
    id: "event-011",
    title: "관악산 등산",
    event_date: futureDate2.toISOString(),
    status: "scheduled",
  }),
  generateEvent(mockGroups[3].id, currentUserId, {
    id: "event-012",
    title: "설악산 당일치기",
    event_date: futureDate3.toISOString(),
    status: "scheduled",
  }),
];

/**
 * 이벤트 참여자 40건 (이벤트당 평균 3-4명)
 */
export const mockParticipants: Participant[] = [
  // event-001 (수영 - 완료)
  generateParticipant("event-001", currentUserId, { status: "attending" }),
  generateParticipant("event-001", mockProfiles[1].id, { status: "attending" }),
  generateParticipant("event-001", mockProfiles[4].id, { status: "not_attending" }),

  // event-002 (수영 - 예정)
  generateParticipant("event-002", currentUserId, { status: "attending" }),
  generateParticipant("event-002", mockProfiles[1].id, { status: "maybe" }),
  generateParticipant("event-002", mockProfiles[5].id, { status: "attending" }),
  generateParticipant("event-002", mockProfiles[6].id, { status: "attending" }),

  // event-003 (수영 - 예정)
  generateParticipant("event-003", currentUserId, { status: "attending" }),
  generateParticipant("event-003", mockProfiles[1].id, { status: "attending" }),
  generateParticipant("event-003", mockProfiles[4].id, { status: "maybe" }),

  // event-004 (헬스 - 완료)
  generateParticipant("event-004", currentUserId, { status: "attending" }),
  generateParticipant("event-004", mockProfiles[1].id, { status: "attending" }),
  generateParticipant("event-004", mockProfiles[2].id, { status: "not_attending" }),
  generateParticipant("event-004", mockProfiles[3].id, { status: "attending" }),

  // event-005 (헬스 - 예정)
  generateParticipant("event-005", currentUserId, { status: "attending" }),
  generateParticipant("event-005", mockProfiles[1].id, { status: "attending" }),
  generateParticipant("event-005", mockProfiles[7].id, { status: "maybe" }),

  // event-006 (헬스 - 예정)
  generateParticipant("event-006", currentUserId, { status: "maybe" }),
  generateParticipant("event-006", mockProfiles[1].id, { status: "attending" }),
  generateParticipant("event-006", mockProfiles[2].id, { status: "attending" }),
  generateParticipant("event-006", mockProfiles[3].id, { status: "attending" }),

  // event-007 (독서 - 완료)
  generateParticipant("event-007", currentUserId, { status: "attending" }),
  generateParticipant("event-007", mockProfiles[2].id, { status: "attending" }),
  generateParticipant("event-007", mockProfiles[3].id, { status: "attending" }),
  generateParticipant("event-007", mockProfiles[4].id, { status: "not_attending" }),

  // event-008 (독서 - 예정)
  generateParticipant("event-008", currentUserId, { status: "attending" }),
  generateParticipant("event-008", mockProfiles[2].id, { status: "attending" }),
  generateParticipant("event-008", mockProfiles[3].id, { status: "maybe" }),

  // event-009 (독서 - 예정)
  generateParticipant("event-009", currentUserId, { status: "attending" }),
  generateParticipant("event-009", mockProfiles[2].id, { status: "attending" }),
  generateParticipant("event-009", mockProfiles[4].id, { status: "attending" }),
  generateParticipant("event-009", mockProfiles[5].id, { status: "maybe" }),

  // event-010 (등산 - 예정)
  generateParticipant("event-010", currentUserId, { status: "attending" }),
  generateParticipant("event-010", mockProfiles[3].id, { status: "attending" }),
  generateParticipant("event-010", mockProfiles[4].id, { status: "attending" }),

  // event-011 (등산 - 예정)
  generateParticipant("event-011", currentUserId, { status: "maybe" }),
  generateParticipant("event-011", mockProfiles[3].id, { status: "attending" }),
  generateParticipant("event-011", mockProfiles[6].id, { status: "attending" }),
  generateParticipant("event-011", mockProfiles[7].id, { status: "attending" }),

  // event-012 (등산 - 예정)
  generateParticipant("event-012", currentUserId, { status: "attending" }),
  generateParticipant("event-012", mockProfiles[3].id, { status: "attending" }),
  generateParticipant("event-012", mockProfiles[4].id, { status: "maybe" }),
];

/**
 * 공지사항 8개 (모임당 2개)
 */
export const mockAnnouncements: Announcement[] = [
  // 수영 모임 공지
  generateAnnouncement(mockGroups[0].id, currentUserId, {
    id: "announce-001",
    title: "수영장 이용 시간 변경 안내",
    content:
      "안녕하세요, 수영 모임 회원 여러분!\n\n다음 주부터 수영장 이용 시간이 오후 2시로 변경됩니다. 참고 부탁드립니다.",
  }),
  generateAnnouncement(mockGroups[0].id, mockProfiles[1].id, {
    id: "announce-002",
    title: "신규 멤버 환영합니다",
    content: "새로 가입하신 회원분들을 진심으로 환영합니다! 함께 즐거운 수영 생활 하시길 바랍니다.",
  }),

  // 헬스 모임 공지
  generateAnnouncement(mockGroups[1].id, mockProfiles[1].id, {
    id: "announce-003",
    title: "PT 일정 조정 공지",
    content:
      "이번 주 PT 일정이 변경되었습니다.\n\n- 기존: 토요일 오전 10시\n- 변경: 토요일 오후 2시\n\n참석 가능하신 분은 댓글로 확인 부탁드립니다.",
  }),
  generateAnnouncement(mockGroups[1].id, currentUserId, {
    id: "announce-004",
    title: "헬스장 휴관일 안내",
    content: "다음 주 월요일은 헬스장 정기 휴무일입니다. 참고 부탁드립니다.",
  }),

  // 독서 모임 공지
  generateAnnouncement(mockGroups[2].id, mockProfiles[2].id, {
    id: "announce-005",
    title: "다음 독서 목록 투표",
    content:
      "다음 달 독서 목록을 투표로 정하려고 합니다.\n\n후보 도서:\n1. 1984 - 조지 오웰\n2. 데미안 - 헤르만 헤세\n3. 카라마조프 가의 형제들 - 도스토옙스키\n\n댓글로 의견 남겨주세요!",
  }),
  generateAnnouncement(mockGroups[2].id, mockProfiles[3].id, {
    id: "announce-006",
    title: "독서 토론회 장소 변경",
    content: "이번 주 독서 토론회 장소가 변경되었습니다. 신촌 카페에서 만나요!",
  }),

  // 등산 모임 공지
  generateAnnouncement(mockGroups[3].id, mockProfiles[3].id, {
    id: "announce-007",
    title: "등산 준비물 안내",
    content:
      "등산 시 필수 준비물:\n\n- 등산화\n- 물 (1L 이상)\n- 간식\n- 모자\n- 선크림\n\n안전한 등산을 위해 꼭 준비해주세요!",
  }),
  generateAnnouncement(mockGroups[3].id, mockProfiles[4].id, {
    id: "announce-008",
    title: "등산 일정 확정",
    content:
      "다음 주 일요일 오전 8시에 북한산 입구에서 만나기로 확정되었습니다. 많은 참여 부탁드립니다!",
  }),
];

/**
 * 알림 로그 15개 (다양한 타입)
 */
export const mockNotifications: NotificationLog[] = [
  // 새 이벤트 알림
  generateNotification(currentUserId, {
    type: "new_event",
    related_event_id: "event-002",
    read_at: null,
  }),
  generateNotification(currentUserId, {
    type: "new_event",
    related_event_id: "event-005",
  }),
  generateNotification(currentUserId, {
    type: "new_event",
    related_event_id: "event-008",
  }),

  // 리마인더 알림
  generateNotification(currentUserId, {
    type: "reminder",
    related_event_id: "event-002",
    read_at: null,
  }),
  generateNotification(currentUserId, {
    type: "reminder",
    related_event_id: "event-005",
  }),
  generateNotification(currentUserId, {
    type: "reminder",
    related_event_id: "event-010",
    read_at: null,
  }),

  // 공지사항 알림
  generateNotification(currentUserId, {
    type: "announcement",
    related_event_id: null,
  }),
  generateNotification(currentUserId, {
    type: "announcement",
    related_event_id: null,
    read_at: null,
  }),
  generateNotification(currentUserId, {
    type: "announcement",
    related_event_id: null,
  }),

  // 다른 사용자들 알림
  generateNotification(mockProfiles[1].id, {
    type: "new_event",
    related_event_id: "event-003",
  }),
  generateNotification(mockProfiles[2].id, {
    type: "reminder",
    related_event_id: "event-008",
  }),
  generateNotification(mockProfiles[3].id, {
    type: "announcement",
    related_event_id: null,
  }),
  generateNotification(mockProfiles[4].id, {
    type: "new_event",
    related_event_id: "event-011",
  }),
  generateNotification(mockProfiles[5].id, {
    type: "reminder",
    related_event_id: "event-009",
  }),
  generateNotification(mockProfiles[6].id, {
    type: "announcement",
    related_event_id: null,
  }),
];

// ============================================
// 관계형 데이터 헬퍼 함수
// ============================================

/**
 * 특정 사용자가 속한 모임 목록 조회
 */
export function getGroupsForUser(userId: string): Group[] {
  const userGroupIds = mockGroupMembers
    .filter((member) => member.user_id === userId)
    .map((member) => member.group_id);

  return mockGroups.filter((group) => userGroupIds.includes(group.id));
}

/**
 * 특정 모임의 멤버 목록 조회 (프로필 포함)
 */
export function getMembersForGroup(
  groupId: string
): GroupMemberWithProfile[] {
  const members = mockGroupMembers.filter(
    (member) => member.group_id === groupId
  );

  return members.map((member) => {
    const profile = mockProfiles.find((p) => p.id === member.user_id);
    if (!profile) {
      throw new Error(`Profile not found for user_id: ${member.user_id}`);
    }
    return {
      ...member,
      profile,
    };
  });
}

/**
 * 특정 모임의 이벤트 목록 조회
 */
export function getEventsForGroup(groupId: string): Event[] {
  return mockEvents.filter((event) => event.group_id === groupId);
}

/**
 * 특정 이벤트의 참여자 목록 조회 (프로필 포함)
 */
export function getParticipantsForEvent(
  eventId: string
): ParticipantWithProfile[] {
  const participants = mockParticipants.filter(
    (participant) => participant.event_id === eventId
  );

  return participants.map((participant) => {
    const profile = mockProfiles.find((p) => p.id === participant.user_id);
    if (!profile) {
      throw new Error(`Profile not found for user_id: ${participant.user_id}`);
    }
    return {
      ...participant,
      profile,
    };
  });
}

/**
 * 다가오는 이벤트 목록 조회 (모임 정보 포함)
 */
export function getUpcomingEvents(): EventWithGroup[] {
  const now = new Date();
  const upcomingEvents = mockEvents.filter((event) => {
    const eventDate = new Date(event.event_date);
    return eventDate > now && event.status === "scheduled";
  });

  return upcomingEvents.map((event) => {
    const group = mockGroups.find((g) => g.id === event.group_id);
    if (!group) {
      throw new Error(`Group not found for group_id: ${event.group_id}`);
    }
    return {
      ...event,
      group,
    };
  });
}

/**
 * 최근 공지사항 목록 조회 (작성자 정보 포함)
 */
export function getRecentAnnouncements(): AnnouncementWithAuthor[] {
  // created_at 기준으로 정렬 (최신순)
  const sortedAnnouncements = [...mockAnnouncements].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sortedAnnouncements.map((announcement) => {
    const author = mockProfiles.find((p) => p.id === announcement.author_id);
    if (!author) {
      throw new Error(
        `Author not found for author_id: ${announcement.author_id}`
      );
    }
    return {
      ...announcement,
      author,
    };
  });
}
