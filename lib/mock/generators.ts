// Mock 데이터 생성 함수
// faker 한국어 로케일 사용

import { faker } from "@faker-js/faker/locale/ko";
import type {
  Profile,
  Group,
  GroupMember,
  Event,
  Participant,
  Announcement,
  NotificationLog,
} from "@/types/database";
import type {
  Role,
  AttendanceStatus,
  EventStatus,
  NotificationType,
} from "@/types/enums";

/**
 * UUID 생성 함수
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 과거 날짜 생성 (ISO 타임스탬프)
 * @param maxDays - 최대 과거 일수 (기본값: 30일)
 */
export function generatePastDate(maxDays: number = 30): string {
  const years = maxDays / 365;
  return faker.date.past({ years }).toISOString();
}

/**
 * 미래 날짜 생성 (ISO 타임스탬프)
 * @param maxDays - 최대 미래 일수 (기본값: 30일)
 */
export function generateFutureDate(maxDays: number = 30): string {
  const years = maxDays / 365;
  return faker.date.future({ years }).toISOString();
}

/**
 * 사용자 프로필 생성
 */
export function generateProfile(overrides?: Partial<Profile>): Profile {
  const id = overrides?.id || generateId();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${lastName}${firstName}`;

  return {
    id,
    email: faker.internet.email({
      firstName: firstName,
      lastName: lastName,
      provider: "example.com",
    }),
    full_name: fullName,
    avatar_url: faker.datatype.boolean()
      ? faker.image.avatar()
      : null,
    created_at: generatePastDate(90),
    ...overrides,
  };
}

/**
 * 모임 그룹 생성
 */
export function generateGroup(
  ownerId: string,
  overrides?: Partial<Group>
): Group {
  const groupTypes = [
    "수영",
    "헬스",
    "독서",
    "등산",
    "요가",
    "러닝",
    "사이클",
    "배드민턴",
  ];
  const groupType =
    faker.helpers.arrayElement(groupTypes);

  return {
    id: generateId(),
    name: `${groupType} 모임`,
    description: faker.lorem.sentence({ min: 5, max: 15 }),
    image_url: faker.datatype.boolean()
      ? faker.image.url()
      : null,
    invite_code: faker.string.alphanumeric(8).toUpperCase(),
    invite_code_expires_at: faker.datatype.boolean()
      ? generateFutureDate(30)
      : null,
    owner_id: ownerId,
    created_at: generatePastDate(60),
    ...overrides,
  };
}

/**
 * 그룹 멤버 생성
 */
export function generateGroupMember(
  groupId: string,
  userId: string,
  role: Role,
  overrides?: Partial<GroupMember>
): GroupMember {
  return {
    id: generateId(),
    group_id: groupId,
    user_id: userId,
    role,
    joined_at: generatePastDate(45),
    ...overrides,
  };
}

/**
 * 이벤트 생성
 */
export function generateEvent(
  groupId: string,
  createdBy: string,
  overrides?: Partial<Event>
): Event {
  const eventTitles = [
    "주말 수영장 모임",
    "헬스장 PT 세션",
    "독서 토론회",
    "등산 모임",
    "요가 클래스",
    "러닝 크루",
    "사이클 투어",
    "배드민턴 경기",
  ];

  const locations = [
    "서울 강남구 테헤란로 123",
    "서울 마포구 월드컵로 456",
    "경기 성남시 분당구 판교역로 789",
    "서울 송파구 올림픽로 321",
    "서울 영등포구 여의대로 654",
  ];

  const now = new Date();
  const eventDate = new Date(
    now.getTime() + faker.number.int({ min: -7, max: 14 }) * 24 * 60 * 60 * 1000
  );
  const responseDeadline = new Date(
    eventDate.getTime() - 2 * 24 * 60 * 60 * 1000
  );

  // 이벤트 상태 결정 (날짜 기반)
  let status: EventStatus = "scheduled";
  if (eventDate < now) {
    const hoursSince = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
    status = hoursSince > 3 ? "completed" : "ongoing";
  }

  return {
    id: generateId(),
    group_id: groupId,
    title: faker.helpers.arrayElement(eventTitles),
    description: faker.lorem.sentences({ min: 2, max: 4 }),
    event_date: eventDate.toISOString(),
    location: faker.helpers.arrayElement(locations),
    response_deadline: responseDeadline.toISOString(),
    status,
    max_participants: faker.helpers.arrayElement([null, 5, 8, 10, 15]),
    cost: faker.helpers.arrayElement([0, 5000, 10000, 15000, 20000]),
    created_by: createdBy,
    created_at: generatePastDate(30),
    ...overrides,
  };
}

/**
 * 이벤트 참여자 생성
 */
export function generateParticipant(
  eventId: string,
  userId: string,
  overrides?: Partial<Participant>
): Participant {
  const statuses: AttendanceStatus[] = ["attending", "not_attending", "maybe"];

  return {
    id: generateId(),
    event_id: eventId,
    user_id: userId,
    status: faker.helpers.arrayElement(statuses),
    responded_at: generatePastDate(7),
    ...overrides,
  };
}

/**
 * 공지사항 생성
 */
export function generateAnnouncement(
  groupId: string,
  authorId: string,
  overrides?: Partial<Announcement>
): Announcement {
  const announcementTitles = [
    "모임 일정 변경 안내",
    "신규 멤버 환영합니다!",
    "다음 주 이벤트 공지",
    "모임비 납부 안내",
    "장소 변경 공지",
    "특별 이벤트 안내",
  ];

  return {
    id: generateId(),
    group_id: groupId,
    event_id: null,
    title: faker.helpers.arrayElement(announcementTitles),
    content: faker.lorem.paragraphs({ min: 2, max: 4 }),
    author_id: authorId,
    created_at: generatePastDate(14),
    ...overrides,
  };
}

/**
 * 알림 로그 생성
 */
export function generateNotification(
  userId: string,
  overrides?: Partial<NotificationLog>
): NotificationLog {
  const notificationTypes: NotificationType[] = [
    "new_event",
    "reminder",
    "announcement",
  ];

  const type =
    overrides?.type || faker.helpers.arrayElement(notificationTypes);

  let title = "";
  let message = "";

  switch (type) {
    case "new_event":
      title = "새로운 이벤트가 등록되었습니다";
      message = "모임에 새로운 이벤트가 추가되었습니다. 참석 여부를 확인해주세요.";
      break;
    case "reminder":
      title = "이벤트 리마인더";
      message = "곧 시작될 이벤트가 있습니다. 참석 준비를 해주세요.";
      break;
    case "announcement":
      title = "새로운 공지사항";
      message = "모임에 새로운 공지사항이 등록되었습니다.";
      break;
  }

  const sentAt = new Date(generatePastDate(7));
  const readAt = faker.datatype.boolean()
    ? new Date(
        sentAt.getTime() + faker.number.int({ min: 1, max: 48 }) * 60 * 60 * 1000
      ).toISOString()
    : null;

  return {
    id: generateId(),
    user_id: userId,
    type,
    title,
    message,
    related_event_id: type === "new_event" || type === "reminder"
      ? generateId()
      : null,
    sent_at: sentAt.toISOString(),
    read_at: readAt,
    ...overrides,
  };
}
