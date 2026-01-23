// 권한 관련 유틸리티 함수 (순수 함수 - 클라이언트/서버 모두 사용 가능)
// 멤버 역할 관리 및 권한 체크

import type { Role } from "@/types/enums";

// 서버 전용 함수 (checkMemberRole)는 lib/utils/permissions-server.ts에 있습니다.
// 서버 컴포넌트에서 checkMemberRole을 사용하려면:
// import { checkMemberRole } from "@/lib/utils/permissions-server";

/**
 * 멤버 관리 권한 확인 (owner/admin만 true)
 * @param role - 확인할 역할
 * @returns boolean - 멤버 관리 권한 여부
 */
export function canManageMembers(role: Role): boolean {
  return role === "owner" || role === "admin";
}

/**
 * 역할 변경 가능 여부 확인
 * @param currentRole - 현재 사용자의 역할
 * @param targetRole - 대상 멤버의 현재 역할
 * @param newRole - 변경하려는 역할
 * @returns boolean - 역할 변경 가능 여부
 *
 * 규칙:
 * - owner는 절대 변경 불가
 * - owner만 admin 지정 가능
 * - admin은 member 역할만 변경 가능
 * - 본인 역할 변경 불가 (호출하는 곳에서 체크)
 */
export function canChangeRoleTo(
  currentRole: Role,
  targetRole: Role,
  newRole: Role
): boolean {
  // owner 역할은 절대 변경 불가
  if (targetRole === "owner") {
    return false;
  }

  // owner는 admin/member 모두 변경 가능
  if (currentRole === "owner") {
    return newRole === "admin" || newRole === "member";
  }

  // admin은 member 역할만 변경 가능
  if (currentRole === "admin") {
    return newRole === "member";
  }

  // member는 역할 변경 권한 없음
  return false;
}

/**
 * 멤버 제거 가능 여부 확인
 * @param currentRole - 현재 사용자의 역할
 * @param targetRole - 대상 멤버의 역할
 * @returns boolean - 멤버 제거 가능 여부
 *
 * 규칙:
 * - owner/admin만 가능
 * - owner는 제거 불가
 */
export function canRemoveMember(currentRole: Role, targetRole: Role): boolean {
  // owner나 admin만 멤버 제거 가능
  if (!canManageMembers(currentRole)) {
    return false;
  }

  // owner는 제거 불가
  if (targetRole === "owner") {
    return false;
  }

  return true;
}

// ============================================
// 이벤트 관련 권한 함수
// ============================================

/**
 * 이벤트 생성 권한 확인 (owner/admin만 true)
 * @param role - 확인할 역할
 * @returns boolean - 이벤트 생성 권한 여부
 */
export function canCreateEvent(role: Role): boolean {
  return role === "owner" || role === "admin";
}

/**
 * 이벤트 관리 권한 확인 (수정/삭제)
 * @param userRole - 현재 사용자의 역할
 * @param eventCreatedBy - 이벤트 생성자 ID
 * @param currentUserId - 현재 사용자 ID
 * @returns boolean - 이벤트 관리 권한 여부
 *
 * 규칙:
 * - owner는 모든 이벤트 관리 가능
 * - admin은 자신이 생성한 이벤트만 관리 가능
 * - member는 관리 권한 없음
 */
export function canManageEvent(
  userRole: Role,
  eventCreatedBy: string,
  currentUserId: string
): boolean {
  // owner는 모든 이벤트 관리 가능
  if (userRole === "owner") {
    return true;
  }

  // admin은 자신이 생성한 이벤트만 관리 가능
  if (userRole === "admin" && eventCreatedBy === currentUserId) {
    return true;
  }

  // member는 관리 권한 없음
  return false;
}

// ============================================
// 공지사항 관련 권한 함수
// ============================================

/**
 * 공지사항 작성 권한 확인 (owner/admin만 true)
 * @param role - 확인할 역할
 * @returns boolean - 공지사항 작성 권한 여부
 */
export function canCreateAnnouncement(role: Role): boolean {
  return role === "owner" || role === "admin";
}

/**
 * 공지사항 관리 권한 확인 (수정/삭제)
 * @param userRole - 현재 사용자의 역할
 * @param authorId - 공지사항 작성자 ID
 * @param currentUserId - 현재 사용자 ID
 * @returns boolean - 공지사항 관리 권한 여부
 *
 * 규칙:
 * - owner는 모든 공지사항 관리 가능
 * - admin은 자신이 작성한 공지사항만 관리 가능
 * - member는 관리 권한 없음
 */
export function canManageAnnouncement(
  userRole: Role,
  authorId: string,
  currentUserId: string
): boolean {
  // owner는 모든 공지사항 관리 가능
  if (userRole === "owner") {
    return true;
  }

  // admin은 자신이 작성한 공지사항만 관리 가능
  if (userRole === "admin" && authorId === currentUserId) {
    return true;
  }

  // member는 관리 권한 없음
  return false;
}
