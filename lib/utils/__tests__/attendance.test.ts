/**
 * 참석률 계산 유틸리티 테스트
 */

import {
  calculateAttendanceStats,
  formatAttendanceRate,
  formatAttendanceStats,
  type ParticipantCounts,
} from "../attendance";

describe("calculateAttendanceStats", () => {
  it("totalMembers 없이 기본 통계만 계산", () => {
    const counts: ParticipantCounts = {
      attending: 8,
      not_attending: 2,
      maybe: 1,
    };

    const stats = calculateAttendanceStats(counts);

    expect(stats.attending).toBe(8);
    expect(stats.notAttending).toBe(2);
    expect(stats.maybe).toBe(1);
    expect(stats.total).toBe(11);
    expect(stats.attendanceRate).toBeUndefined();
    expect(stats.responseRate).toBeUndefined();
  });

  it("totalMembers가 있을 때 참석률과 응답률 계산", () => {
    const counts: ParticipantCounts = {
      attending: 8,
      not_attending: 2,
      maybe: 1,
    };

    const stats = calculateAttendanceStats(counts, 15);

    expect(stats.attending).toBe(8);
    expect(stats.notAttending).toBe(2);
    expect(stats.maybe).toBe(1);
    expect(stats.total).toBe(11);
    expect(stats.attendanceRate).toBe(53.3); // (8/15) * 100 = 53.33... → 53.3
    expect(stats.responseRate).toBe(73.3); // (11/15) * 100 = 73.33... → 73.3
  });

  it("0명일 때 처리", () => {
    const counts: ParticipantCounts = {
      attending: 0,
      not_attending: 0,
      maybe: 0,
    };

    const stats = calculateAttendanceStats(counts, 10);

    expect(stats.attending).toBe(0);
    expect(stats.notAttending).toBe(0);
    expect(stats.maybe).toBe(0);
    expect(stats.total).toBe(0);
    expect(stats.attendanceRate).toBe(0);
    expect(stats.responseRate).toBe(0);
  });

  it("totalMembers가 0일 때 비율 계산 생략", () => {
    const counts: ParticipantCounts = {
      attending: 5,
      not_attending: 2,
      maybe: 1,
    };

    const stats = calculateAttendanceStats(counts, 0);

    expect(stats.total).toBe(8);
    expect(stats.attendanceRate).toBeUndefined();
    expect(stats.responseRate).toBeUndefined();
  });

  it("100% 참석률 계산", () => {
    const counts: ParticipantCounts = {
      attending: 10,
      not_attending: 0,
      maybe: 0,
    };

    const stats = calculateAttendanceStats(counts, 10);

    expect(stats.attendanceRate).toBe(100.0);
    expect(stats.responseRate).toBe(100.0);
  });

  it("소수점 반올림 확인", () => {
    const counts: ParticipantCounts = {
      attending: 7,
      not_attending: 2,
      maybe: 1,
    };

    const stats = calculateAttendanceStats(counts, 13);

    // 7/13 = 0.5384... → 53.8%
    expect(stats.attendanceRate).toBe(53.8);
    // 10/13 = 0.7692... → 76.9%
    expect(stats.responseRate).toBe(76.9);
  });
});

describe("formatAttendanceRate", () => {
  it("소수점 1자리로 퍼센트 포맷팅", () => {
    expect(formatAttendanceRate(75.5)).toBe("75.5%");
    expect(formatAttendanceRate(100)).toBe("100.0%");
    expect(formatAttendanceRate(0)).toBe("0.0%");
    expect(formatAttendanceRate(53.33)).toBe("53.3%");
  });

  it("반올림 확인", () => {
    expect(formatAttendanceRate(75.55)).toBe("75.6%");
    expect(formatAttendanceRate(75.54)).toBe("75.5%");
  });
});

describe("formatAttendanceStats", () => {
  it("모든 상태가 있을 때", () => {
    const stats = {
      attending: 8,
      notAttending: 2,
      maybe: 1,
      total: 11,
    };

    expect(formatAttendanceStats(stats)).toBe("참석 8명 • 불참 2명 • 미정 1명");
  });

  it("참석만 있을 때", () => {
    const stats = {
      attending: 10,
      notAttending: 0,
      maybe: 0,
      total: 10,
    };

    expect(formatAttendanceStats(stats)).toBe("참석 10명");
  });

  it("불참과 미정만 있을 때", () => {
    const stats = {
      attending: 0,
      notAttending: 3,
      maybe: 2,
      total: 5,
    };

    expect(formatAttendanceStats(stats)).toBe("불참 3명 • 미정 2명");
  });

  it("응답이 없을 때", () => {
    const stats = {
      attending: 0,
      notAttending: 0,
      maybe: 0,
      total: 0,
    };

    expect(formatAttendanceStats(stats)).toBe("응답 없음");
  });
});
