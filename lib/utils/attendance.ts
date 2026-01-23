/**
 * 이벤트 참석률 계산 유틸리티
 *
 * 이벤트 참가자 수를 기반으로 참석률, 응답률 등의 통계를 계산합니다.
 */

/**
 * 참가자 수 카운트 타입
 */
export interface ParticipantCounts {
  /** 참석 예정 인원 */
  attending: number;
  /** 불참 인원 */
  not_attending: number;
  /** 미정 인원 */
  maybe: number;
}

/**
 * 참석 통계 타입
 */
export interface AttendanceStats {
  /** 참석 예정 인원 */
  attending: number;
  /** 불참 인원 */
  notAttending: number;
  /** 미정 인원 */
  maybe: number;
  /** 총 응답자 수 (attending + not_attending + maybe) */
  total: number;
  /** 참석률 (참석 예정 / 전체 멤버 수) - 백분율 (0~100) */
  attendanceRate?: number;
  /** 응답률 (총 응답자 / 전체 멤버 수) - 백분율 (0~100) */
  responseRate?: number;
}

/**
 * 이벤트 참석 통계 계산
 *
 * @param counts - 참가자 수 카운트 { attending, not_attending, maybe }
 * @param totalMembers - 전체 모임 멤버 수 (선택사항)
 * @returns 참석 통계 객체
 *
 * @example
 * ```typescript
 * const counts = { attending: 8, not_attending: 2, maybe: 1 };
 * const stats = calculateAttendanceStats(counts, 15);
 * // {
 * //   attending: 8,
 * //   notAttending: 2,
 * //   maybe: 1,
 * //   total: 11,
 * //   attendanceRate: 53.3,
 * //   responseRate: 73.3
 * // }
 * ```
 */
export function calculateAttendanceStats(
  counts: ParticipantCounts,
  totalMembers?: number
): AttendanceStats {
  const { attending, not_attending, maybe } = counts;

  // 총 응답자 수
  const total = attending + not_attending + maybe;

  // 기본 통계 (비율 제외)
  const baseStats: AttendanceStats = {
    attending,
    notAttending: not_attending,
    maybe,
    total,
  };

  // totalMembers가 없거나 0이면 비율 계산 생략
  if (!totalMembers || totalMembers === 0) {
    return baseStats;
  }

  // 참석률: (참석 예정 인원 / 전체 멤버 수) * 100
  const attendanceRate =
    totalMembers > 0 ? (attending / totalMembers) * 100 : 0;

  // 응답률: (총 응답자 수 / 전체 멤버 수) * 100
  const responseRate = totalMembers > 0 ? (total / totalMembers) * 100 : 0;

  return {
    ...baseStats,
    attendanceRate: Math.round(attendanceRate * 10) / 10, // 소수점 1자리 반올림
    responseRate: Math.round(responseRate * 10) / 10, // 소수점 1자리 반올림
  };
}

/**
 * 참석률/응답률을 퍼센트 문자열로 포맷팅
 *
 * @param rate - 비율 값 (0~100)
 * @returns 포맷된 퍼센트 문자열 (예: "75.5%")
 *
 * @example
 * ```typescript
 * formatAttendanceRate(75.5); // "75.5%"
 * formatAttendanceRate(100);  // "100.0%"
 * formatAttendanceRate(0);    // "0.0%"
 * ```
 */
export function formatAttendanceRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * 참석 통계를 사용자 친화적인 텍스트로 변환
 *
 * @param stats - 참석 통계 객체
 * @returns 포맷된 통계 텍스트
 *
 * @example
 * ```typescript
 * const stats = { attending: 8, notAttending: 2, maybe: 1, total: 11 };
 * formatAttendanceStats(stats);
 * // "참석 8명 • 불참 2명 • 미정 1명"
 * ```
 */
export function formatAttendanceStats(stats: AttendanceStats): string {
  const parts: string[] = [];

  if (stats.attending > 0) {
    parts.push(`참석 ${stats.attending}명`);
  }
  if (stats.notAttending > 0) {
    parts.push(`불참 ${stats.notAttending}명`);
  }
  if (stats.maybe > 0) {
    parts.push(`미정 ${stats.maybe}명`);
  }

  return parts.length > 0 ? parts.join(" • ") : "응답 없음";
}
