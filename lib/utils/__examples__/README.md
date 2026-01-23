# 참석률 계산 유틸리티 사용 가이드

## 개요

`lib/utils/attendance.ts`는 이벤트 참석 현황을 계산하고 포맷팅하는 유틸리티 함수를 제공합니다.

## 주요 함수

### 1. `calculateAttendanceStats`

참석 통계를 계산합니다.

```typescript
import { calculateAttendanceStats } from "@/lib/utils/attendance";

// 기본 사용 (비율 계산 없음)
const counts = { attending: 8, not_attending: 2, maybe: 1 };
const stats = calculateAttendanceStats(counts);
// {
//   attending: 8,
//   notAttending: 2,
//   maybe: 1,
//   total: 11
// }

// 전체 멤버 수를 포함하여 비율 계산
const statsWithRates = calculateAttendanceStats(counts, 15);
// {
//   attending: 8,
//   notAttending: 2,
//   maybe: 1,
//   total: 11,
//   attendanceRate: 53.3,   // (8/15) * 100
//   responseRate: 73.3      // (11/15) * 100
// }
```

### 2. `formatAttendanceRate`

퍼센트를 포맷팅합니다.

```typescript
import { formatAttendanceRate } from "@/lib/utils/attendance";

formatAttendanceRate(75.5);  // "75.5%"
formatAttendanceRate(100);   // "100.0%"
formatAttendanceRate(0);     // "0.0%"
```

### 3. `formatAttendanceStats`

통계를 사용자 친화적인 텍스트로 변환합니다.

```typescript
import { formatAttendanceStats } from "@/lib/utils/attendance";

const stats = { attending: 8, notAttending: 2, maybe: 1, total: 11 };
formatAttendanceStats(stats);
// "참석 8명 • 불참 2명 • 미정 1명"

const noResponse = { attending: 0, notAttending: 0, maybe: 0, total: 0 };
formatAttendanceStats(noResponse);
// "응답 없음"
```

## 실전 예제

### Server Component에서 사용

```typescript
import { getParticipantCounts } from "@/app/actions/participants";
import { calculateAttendanceStats, formatAttendanceStats, formatAttendanceRate } from "@/lib/utils/attendance";

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const { eventId } = await params;

  // 1. 참가자 카운트 조회
  const counts = await getParticipantCounts(eventId);

  // 2. 통계 계산 (선택: 전체 멤버 수 포함)
  const stats = calculateAttendanceStats(counts, 15);

  return (
    <div>
      <h2>참석 현황</h2>

      {/* 간단한 텍스트 표시 */}
      <p className="text-sm text-muted-foreground">
        {formatAttendanceStats(stats)}
      </p>

      {/* 참석률 표시 (totalMembers를 제공한 경우) */}
      {stats.attendanceRate !== undefined && (
        <div>
          <span>참석률: </span>
          <span className="font-semibold">
            {formatAttendanceRate(stats.attendanceRate)}
          </span>
        </div>
      )}

      {/* 응답률 표시 */}
      {stats.responseRate !== undefined && (
        <div>
          <span>응답률: </span>
          <span className="font-semibold">
            {formatAttendanceRate(stats.responseRate)}
          </span>
        </div>
      )}
    </div>
  );
}
```

### Client Component에서 사용

```typescript
"use client";

import { useEffect, useState } from "react";
import { getParticipantCounts } from "@/app/actions/participants";
import { calculateAttendanceStats, formatAttendanceStats } from "@/lib/utils/attendance";
import type { AttendanceStats } from "@/lib/utils/attendance";

export function EventAttendanceCard({ eventId }: { eventId: string }) {
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const counts = await getParticipantCounts(eventId);
      const calculatedStats = calculateAttendanceStats(counts);
      setStats(calculatedStats);
    }

    loadStats();
  }, [eventId]);

  if (!stats) return <div>로딩 중...</div>;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-2">참석 현황</h3>
      <p className="text-sm">{formatAttendanceStats(stats)}</p>
    </div>
  );
}
```

## 타입 정의

```typescript
// 입력 타입
export interface ParticipantCounts {
  attending: number;
  not_attending: number;
  maybe: number;
}

// 출력 타입
export interface AttendanceStats {
  attending: number;
  notAttending: number;
  maybe: number;
  total: number;
  attendanceRate?: number;  // 0~100
  responseRate?: number;    // 0~100
}
```

## 엣지 케이스 처리

### 1. 응답이 없을 때

```typescript
const counts = { attending: 0, not_attending: 0, maybe: 0 };
const stats = calculateAttendanceStats(counts);
// { attending: 0, notAttending: 0, maybe: 0, total: 0 }

formatAttendanceStats(stats); // "응답 없음"
```

### 2. totalMembers가 0일 때

```typescript
const counts = { attending: 5, not_attending: 2, maybe: 1 };
const stats = calculateAttendanceStats(counts, 0);
// attendanceRate와 responseRate는 undefined (계산 안 함)
```

### 3. totalMembers가 없을 때

```typescript
const counts = { attending: 5, not_attending: 2, maybe: 1 };
const stats = calculateAttendanceStats(counts);
// attendanceRate와 responseRate는 undefined (계산 안 함)
```

## 주의사항

1. **비율 계산 조건**: `totalMembers`가 제공되고 0보다 클 때만 `attendanceRate`와 `responseRate`가 계산됩니다.

2. **소수점 처리**: 비율은 자동으로 소수점 1자리로 반올림됩니다.

3. **타입 안전성**: TypeScript를 사용하므로 타입 에러 없이 안전하게 사용할 수 있습니다.

4. **기존 함수와 통합**: `app/actions/participants.ts`의 `getParticipantCounts` 함수와 완벽하게 호환됩니다.
