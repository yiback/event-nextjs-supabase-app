/**
 * attendance.ts 사용 예제
 *
 * 이 파일은 참석률 계산 유틸리티의 사용 예제를 보여줍니다.
 */

import {
  calculateAttendanceStats,
  formatAttendanceRate,
  formatAttendanceStats,
  type ParticipantCounts,
} from "../attendance";

// ============================================================
// 예제 1: 기본 통계 계산 (totalMembers 없음)
// ============================================================
console.log("=== 예제 1: 기본 통계만 계산 ===");

const counts1: ParticipantCounts = {
  attending: 8,
  not_attending: 2,
  maybe: 1,
};

const stats1 = calculateAttendanceStats(counts1);
console.log(stats1);
// {
//   attending: 8,
//   notAttending: 2,
//   maybe: 1,
//   total: 11
// }

// ============================================================
// 예제 2: 참석률과 응답률 계산 (totalMembers 포함)
// ============================================================
console.log("\n=== 예제 2: 참석률/응답률 포함 ===");

const counts2: ParticipantCounts = {
  attending: 8,
  not_attending: 2,
  maybe: 1,
};

const stats2 = calculateAttendanceStats(counts2, 15);
console.log(stats2);
// {
//   attending: 8,
//   notAttending: 2,
//   maybe: 1,
//   total: 11,
//   attendanceRate: 53.3,   // (8/15) * 100
//   responseRate: 73.3      // (11/15) * 100
// }

// ============================================================
// 예제 3: 퍼센트 포맷팅
// ============================================================
console.log("\n=== 예제 3: 퍼센트 포맷팅 ===");

if (stats2.attendanceRate !== undefined) {
  console.log("참석률:", formatAttendanceRate(stats2.attendanceRate));
  // "53.3%"
}

if (stats2.responseRate !== undefined) {
  console.log("응답률:", formatAttendanceRate(stats2.responseRate));
  // "73.3%"
}

// ============================================================
// 예제 4: 사용자 친화적인 텍스트 변환
// ============================================================
console.log("\n=== 예제 4: 통계 텍스트 변환 ===");

console.log(formatAttendanceStats(stats2));
// "참석 8명 • 불참 2명 • 미정 1명"

// ============================================================
// 예제 5: 엣지 케이스 - 0명일 때
// ============================================================
console.log("\n=== 예제 5: 응답 없음 ===");

const counts3: ParticipantCounts = {
  attending: 0,
  not_attending: 0,
  maybe: 0,
};

const stats3 = calculateAttendanceStats(counts3, 10);
console.log(stats3);
console.log(formatAttendanceStats(stats3));
// "응답 없음"

// ============================================================
// 예제 6: 실전 활용 - Server Component에서 사용
// ============================================================
console.log("\n=== 예제 6: 실전 활용 (Server Component) ===");

// Server Component 예시
async function EventDetailPage({ eventId }: { eventId: string }) {
  // 1. getParticipantCounts로 데이터 가져오기
  // const counts = await getParticipantCounts(eventId);

  // 2. 모임 멤버 수 조회 (선택사항)
  // const groupMembersCount = await getGroupMembersCount(groupId);

  // 3. 통계 계산
  // const stats = calculateAttendanceStats(counts, groupMembersCount);

  // 4. UI에 표시
  // return (
  //   <div>
  //     <h2>참석 현황</h2>
  //     <p>{formatAttendanceStats(stats)}</p>
  //     {stats.attendanceRate && (
  //       <p>참석률: {formatAttendanceRate(stats.attendanceRate)}</p>
  //     )}
  //     {stats.responseRate && (
  //       <p>응답률: {formatAttendanceRate(stats.responseRate)}</p>
  //     )}
  //   </div>
  // );
}

// ============================================================
// 예제 7: 100% 참석률
// ============================================================
console.log("\n=== 예제 7: 100% 참석률 ===");

const counts4: ParticipantCounts = {
  attending: 10,
  not_attending: 0,
  maybe: 0,
};

const stats4 = calculateAttendanceStats(counts4, 10);
console.log(stats4);
console.log(`참석률: ${formatAttendanceRate(stats4.attendanceRate!)}`);
console.log(`응답률: ${formatAttendanceRate(stats4.responseRate!)}`);
// 참석률: 100.0%
// 응답률: 100.0%

console.log("\n=== 모든 예제 완료 ===");
